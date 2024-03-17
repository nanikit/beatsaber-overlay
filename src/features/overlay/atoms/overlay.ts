import { atom } from "jotai";
import { getReconnectingWebSocket } from "../../../modules/get_reconnecting_web_socket";
import { loggerAtom } from "../../../atoms/logger";
import { bsPlusOverlayAtom } from "../../bs_plus/atoms";
import { Interaction } from "../types";
import { overlayStateAtom } from "./state";

export const overlayAtom = atom(
  (get) => get(overlayStateAtom),
  async (get, set, value: Interaction) => {
    const aborter = get(aliveWebSocketAtom);
    if (aborter === undefined && value === "initialize") {
      const newAborter = new AbortController();
      getReconnectingWebSocket({
        url: "ws://localhost:2947/socket",
        onOpen: () => {
          set(loggerAtom, { level: "info", type: "socket_open" });
        },
        onMessage: (data) => {
          set(bsPlusOverlayAtom, data);
        },
        onClose: () => {
          set(loggerAtom, { level: "info", type: "socket_close" });
          set(overlayStateAtom, { readyState: WebSocket.CLOSED });
        },
        aborter: newAborter,
      });
      set(aliveWebSocketAtom, newAborter);
    } else if (value === "cleanUp") {
      aborter?.abort();
      set(aliveWebSocketAtom, undefined);
    }
  },
);
overlayAtom.onMount = (set) => {
  set("initialize");
  return () => set("cleanUp");
};

const aliveWebSocketAtom = atom<AbortController | undefined>(undefined);
