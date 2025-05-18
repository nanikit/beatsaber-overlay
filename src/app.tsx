import { useAtomValue, useSetAtom } from "jotai";
import { useLocation } from "react-use";
import { uiTestOverlayAtom, uiTestOverlayClickAtom } from "./atoms/demo";
import { overlayAtom } from "./atoms/overlay";
import { ConnectedOverlay } from "./components/connected_overlay";
import { DisconnectionWarning } from "./components/disconnection_warning";

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
