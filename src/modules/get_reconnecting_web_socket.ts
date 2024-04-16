export async function getReconnectingWebSocket({ url, onOpen, onMessage, onClose, aborter }: {
  url: string;
  onOpen: (socket: WebSocket) => void;
  onMessage: (data: string) => void;
  onClose: () => void;
  aborter: AbortController;
}) {
  const abort = Promise.withResolvers<"aborted">();
  aborter.signal.addEventListener("abort", () => {
    abort.resolve("aborted");
  });

  let retryCount = 0;

  while (!aborter.signal.aborted) {
    const socket = getWebSocket();
    const interval = timeout(10000);

    const result = await waitSocketEvents(socket);
    switch (result) {
      case "open":
        retryCount = 0;
        const result = await waitCloseOrAbort(socket);
        if (result === "aborted") {
          return;
        }
        onClose();
        break;
      case "close":
      case undefined:
        retryCount++;
        break;
      case "aborted":
        socket.close();
        return;
    }

    await Promise.race([interval, abort.promise]);
  }

  function getWebSocket() {
    const socket = new WebSocket(url);
    socket.addEventListener("open", () => onOpen(socket));
    socket.addEventListener("message", (event) => {
      onMessage(event.data);
    });

    return socket;
  }

  async function waitSocketEvents(socket: WebSocket) {
    const closePromise = waitEvent(socket, "close");
    return await Promise.race([
      waitEvent(socket, "open"),
      closePromise,
      abort.promise,
    ]);
  }

  async function waitCloseOrAbort(socket: WebSocket) {
    const closePromise = waitEvent(socket, "close");
    const result = await Promise.race([closePromise, abort.promise]);
    if (result === "aborted") {
      socket.close();
      return "aborted";
    }
    return "close";
  }

  function waitEvent<T extends string>(target: EventTarget, eventName: T) {
    return new Promise<T>((resolve) => {
      target.addEventListener(eventName, () => resolve(eventName), { once: true });
    });
  }
}

function timeout(milliseconds: number): Promise<undefined> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
