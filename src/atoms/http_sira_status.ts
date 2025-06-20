import { atom } from "jotai";
import { withAtomEffect } from "jotai-effect";
import { convertStatus, mergeEvent } from "../helpers/http_sira_status";
import { getReconnectingWebSocket } from "../modules/get_reconnecting_web_socket";
import { addBreadcrumb } from "../modules/logger";
import { HttpSiraStatus, HttpSiraStatusEvent } from "../types/http_sira_status";
import { endpointAtom } from "./endpoint";

const overlayStateAtom = atom<HttpSiraStatus | null>(null);
const siraOverlayStateAtom = atom(
  (get) => {
    const state = get(overlayStateAtom);
    try {
      if (state === null) {
        return { readyState: WebSocket.CLOSED };
      }

      return convertStatus(state);
    } catch (error) {
      addBreadcrumb({ "message": "Current state", data: { state: JSON.stringify(state) } });
      throw error;
    }
  },
);

export const siraOverlayAtom = withAtomEffect(siraOverlayStateAtom, (get, set) => {
  const aborter = new AbortController();

  getReconnectingWebSocket({
    url: "ws://localhost:6557/socket",
    onOpen: () => {
      set(endpointAtom, "siraHttpStatus");
      addBreadcrumb({ level: "info", type: "sira socket_open" });
    },
    onMessage: (data) => {
      const message = JSON.parse(data) as HttpSiraStatusEvent;
      addBreadcrumb({ level: "info", type: "sira socket_message", data: { message } });

      const previous = get(overlayStateAtom);
      set(overlayStateAtom, mergeEvent((previous ?? message) as HttpSiraStatus, message));
    },
    onClose: () => {
      addBreadcrumb({ level: "info", type: "sira socket_close" });
      set(overlayStateAtom, null);
      set(endpointAtom, null);
    },
    aborter,
  });

  return () => {
    aborter.abort();
  };
});
