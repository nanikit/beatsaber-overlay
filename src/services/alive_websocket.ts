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

  let retryCount = 0;
  let socket = getBsPlusWebSocket();
  monitorReconnect(socket);

  aborter.signal.addEventListener("abort", () => {
    socket.close();
  });

  function getBsPlusWebSocket() {
    const socket = new WebSocket(url);
    socket.addEventListener("open", (event) => {
      console.log(event);
      retryCount = 0;
      onOpen();
    });
    socket.addEventListener("message", (event) => {
      onMessage(event.data);
    });
    socket.addEventListener("close", (event) => {
      console.log(event);
      onClose();
    });

    return socket;
  }

  async function monitorReconnect(current: WebSocket) {
    const delay = Math.min(2 ** retryCount * 1000, 60000);
    const isOpened = await Promise.race<true | undefined>([
      new Promise<true>((resolve) => {
        socket.addEventListener("open", () => resolve(true));
      }),
      timeout(delay),
    ]);
    if (isOpened || aborter.signal.aborted) {
      retryCount = 0;
      return;
    }

    current.close();
    socket = getBsPlusWebSocket();
    retryCount = retryCount + 1;
    console.log(`retryCount: ${retryCount}, retry after ${delay / 1000} seconds`);
    monitorReconnect(socket);
  }

  return aborter;
}
