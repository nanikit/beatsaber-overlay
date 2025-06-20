import { useAtomValue } from "jotai";
import { FaDrum, FaKey } from "react-icons/fa";
import { IoIosSpeedometer } from "react-icons/io";
import { idBpmNjsAtom } from "../atoms/view_models";
import { useIsRightLayout, usePalette } from "../hooks/search_param_hooks";
import { OutlinedParagraph } from "./outlined_paragraph";

export function IdBpmNjs() {
  const { id, bpm, noteJumpSpeed, isLoading } = useAtomValue(idBpmNjsAtom);

  const { letter, outline } = usePalette();
  const isRightLayout = useIsRightLayout();

  return (
    <div
      className={`text-[0.12em] h-[2.9989vw] flex items-center gap-[1em] transition-opacity`}
      style={{
        opacity: isLoading ? 0 : 1,
        flexDirection: isRightLayout ? "row-reverse" : undefined,
      }}
    >
      {!!id && (
        <div className="flex items-center">
          <FaKey
            className="text-[0.8em] mr-[0.5em] stroke-[20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{id}</OutlinedParagraph>
        </div>
      )}
      {!!bpm && (
        <div className="flex items-center">
          <FaDrum
            className="text-[0.9em] mr-[0.5em] stroke-[20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{Math.round(bpm * 10) / 10}</OutlinedParagraph>
        </div>
      )}
      {!!noteJumpSpeed && (
        <div className="flex items-center">
          <IoIosSpeedometer
            className="text-[1.0em] mr-[0.4em] stroke-[20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{Math.round(noteJumpSpeed * 10) / 10}</OutlinedParagraph>
        </div>
      )}
    </div>
  );
}
