export function getAliveWebSocket(
  { url, onOpen, onMessage, onClose }: {
    url: string;
    onOpen: (event: Event) => void;
    onMessage: (data: string) => void;
    onClose: (event: CloseEvent) => void;
  },
) {
  const aborter = new AbortController();

  function getBsPlusWebSocket() {
    const sock = new WebSocket(url);
    sock.addEventListener("open", onOpen);
    sock.addEventListener("message", (event) => {
      onMessage(event.data);
    });
    sock.addEventListener("close", onClose);

    return sock;
  }

  async function monitorReconnect() {
    let retryCount = 0;
    let socket = getBsPlusWebSocket();

    aborter.signal.addEventListener("abort", () => {
      socket.close();
    });

    while (true) {
      const delay = 30 * Math.log10(Math.max(2, retryCount + 2)) - 8;
      console.log(
        `retryCount: ${retryCount}, next retry will be in ${Math.ceil(delay)} seconds.`,
      );
      const isOpened = await Promise.race<true | undefined>([
        new Promise<true>((resolve) => {
          socket.addEventListener("open", () => resolve(true), { once: true });
        }),
        timeout(delay * 1000),
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

function timeout(milliseconds: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
