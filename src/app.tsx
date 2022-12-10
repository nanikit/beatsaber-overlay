import { useAtom } from "jotai";
import { useEffect } from "react";
import { useLocation, useSearchParam } from "react-use";
import { DisconnectionWarning } from "./components/disconnection_warning";
import { ConnectedOverlay } from "./containers/connected_overlay";
import { overlayAtom } from "./services/overlay";
import { uiTestOverlayAtom } from "./services/test_overlay";

export function App() {
  const { pathname } = useLocation();
  const [overlay, updateOverlay] = useAtom(
    pathname === "/test/ui" ? uiTestOverlayAtom : overlayAtom,
  );
  const layout = useSearchParam("layout");
  const isRight = layout !== "left";

  useEffect(() => {
    updateOverlay("initialize");
    return () => {
      updateOverlay("cleanUp");
    };
  }, []);

  return (
    <main
      className="w-full h-[20vw] text-white p-[1vw] text-[20vw]"
      onClick={() => updateOverlay("click")}
    >
      {overlay.readyState === WebSocket.OPEN ? (
        <ConnectedOverlay state={overlay} isRight={isRight} />
      ) : (
        <DisconnectionWarning isRight={isRight} />
      )}
    </main>
  );
}
