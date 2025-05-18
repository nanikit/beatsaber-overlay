import { useAtomValue, useSetAtom } from "jotai";
import { useLocation } from "react-use";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { uiTestOverlayAtom, uiTestOverlayClickAtom } from "./features/demo/atoms";
import { overlayAtom } from "./features/overlay/atoms/overlay";
import { ConnectedOverlay } from "./features/overlay/containers/connected_overlay";

export function App() {
  const { pathname } = useLocation();
  const overlay = useAtomValue(
    pathname === "/test/ui" ? uiTestOverlayAtom : overlayAtom,
  );
  const updateOverlay = useSetAtom(uiTestOverlayClickAtom);

  return (
    <div
      className="h-screen"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <main
        className="w-full h-[20vw] text-white p-[1vw] text-[20vw]"
        onClick={updateOverlay}
      >
        {overlay.readyState === WebSocket.OPEN
          ? <ConnectedOverlay state={overlay} />
          : <DisconnectionWarning />}
      </main>
    </div>
  );
}
