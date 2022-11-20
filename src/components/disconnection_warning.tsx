import { useState } from "react";

export function DisconnectionWarning() {
  const [state, setState] = useState({ isHovering: false });
  const { isHovering } = state;

  return (
    <div
      onMouseEnter={() => {
        setState({ ...state, isHovering: true });
      }}
      onMouseLeave={() => {
        setState({ ...state, isHovering: false });
      }}
      className={
        `absolute top-[1vw] right-[1vw] rounded-full transition-all overflow-hidden` +
        ` bg-gradient-to-br from-yellow-300 to-orange-600` +
        ` ${isHovering ? "w-[1.8em] h-[0.25em]" : "w-[0.1em] h-[0.1em]"}`
      }
    >
      {isHovering && (
        // relative is for mouse hover boundary stuttering.
        <div className="relative text-[0.08em] flex flex-col flex-nowrap items-center">
          <p>BS+ song overlay is not connected.</p>
          <p>It'll reconnect within a minute.</p>
        </div>
      )}
    </div>
  );
}
