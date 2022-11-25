import { atom } from "jotai";
import { timeout } from "./utils";

export const aliveWebSocketAtom = atom<AbortController | undefined>(undefined);

export function getAliveWebSocket(
  { url, onOpen, onMessage, onClose }: {
    url: string;
    onOpen: () => void;
    onMessage: (data: string) => void;
    onClose: () => void;
  },
) {
  const aborter = new AbortController();

  function getBsPlusWebSocket() {
    const sock = new WebSocket(url);
    sock.addEventListener("open", (event) => {
      console.log(event);
      onOpen();
    });
    sock.addEventListener("message", (event) => {
      onMessage(event.data);
    });
    sock.addEventListener("close", (event) => {
      console.log(event);
      onClose();
    });

    return sock;
  }

  async function monitorReconnect() {
    let retryCount = 0;
    let socket = getBsPlusWebSocket();

    aborter.signal.addEventListener("abort", () => {
      socket.close();
    });

    while (true) {
      const delay = Math.min(2 ** retryCount * 1000, 60000);
      console.log(`retryCount: ${retryCount}, next retry will be in ${delay / 1000} seconds.`);
      const isOpened = await Promise.race<true | undefined>([
        new Promise<true>((resolve) => {
          socket.addEventListener("open", () => resolve(true), { once: true });
        }),
        timeout(delay),
      ]);

      if (aborter.signal.aborted) {
        return;
      }
      if (isOpened) {
        retryCount = 0;
        await new Promise<true>((resolve) => {
          socket.addEventListener("close", () => resolve(true), { once: true });
        });
        if (aborter.signal.aborted) {
          return;
        }
      } else {
        retryCount++;
        socket.close();
      }

      socket = getBsPlusWebSocket();
    }
  }

  monitorReconnect();

  return aborter;
}
