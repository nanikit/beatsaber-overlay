import { atom } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { getReconnectingWebSocket } from "../../modules/get_reconnecting_web_socket";
import { addBreadcrumb } from "../../modules/logger";
import { endpointAtom } from "../overlay/atoms/endpoint";
import { OverlayState } from "../overlay/types";
import { BsPlusMessageHandler } from "./helpers";
import { BsPlusMessage } from "./types";

const overlayStateAtom = atom<OverlayState>({ readyState: WebSocket.CLOSED });

export const bsPlusOverlayAtom = withAtomEffect(overlayStateAtom, (_get, set) => {
  const handler = new BsPlusMessageHandler((state) => set(overlayStateAtom, state));
  const aborter = new AbortController();
  aborter.signal.addEventListener("abort", handler.dispose);

  getReconnectingWebSocket({
    url: "ws://localhost:2947/socket",
    onOpen: () => {
      set(endpointAtom, "bsPlus");
      addBreadcrumb({ level: "info", type: "socket_open" });
    },
    onMessage: (data) => {
      const message = JSON.parse(data) as BsPlusMessage;
      handler.process(message);
    },
    onClose: () => {
      addBreadcrumb({ level: "info", type: "socket_close" });
      set(endpointAtom, null);
    },
    aborter,
  });

  return () => {
    aborter.abort();
  };
});
