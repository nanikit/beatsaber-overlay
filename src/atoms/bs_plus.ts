import { atom } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { BsPlusMessageHandler } from "../helpers/bs_plus_message_handler";
import { getReconnectingWebSocket } from "../modules/get_reconnecting_web_socket";
import { addBreadcrumb } from "../modules/logger";
import { BsPlusMessage } from "../types/bs_plus";
import { OverlayState } from "../types/overlay";
import { endpointAtom } from "./endpoint";

const overlayStateAtom = atom<OverlayState>({ readyState: WebSocket.CLOSED });

export const bsPlusOverlayAtom = withAtomEffect(overlayStateAtom, (_get, set) => {
  const handler = new BsPlusMessageHandler((state) => set(overlayStateAtom, state));
  const aborter = new AbortController();
  aborter.signal.addEventListener("abort", handler.dispose);

  getReconnectingWebSocket({
    url: "ws://localhost:2947/socket",
    onOpen: () => {
      set(endpointAtom, "bsPlus");
      addBreadcrumb({ level: "info", type: "bsplus socket_open" });
    },
    onMessage: (data) => {
      const message = JSON.parse(data) as BsPlusMessage;
      addBreadcrumb({ level: "info", type: "bsplus socket_message", data: { message } });

      handler.process(message);
    },
    onClose: () => {
      addBreadcrumb({ level: "info", type: "bsplus socket_close" });
      set(endpointAtom, null);
    },
    aborter,
  });

  return () => {
    aborter.abort();
  };
});
