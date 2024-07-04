import { FaDrum, FaKey } from "react-icons/fa";
import { IoIosSpeedometer } from "react-icons/io";
import { OutlinedParagraph } from "../../../components/outlined_paragraph";
import { useHideList, useIsRightLayout, usePalette } from "../../../hooks/search_param_hooks";

type Props = {
  id?: string;
  bpm?: number;
  noteJumpSpeed?: number;
};

export function IdBpmNjs({ id, bpm, noteJumpSpeed }: Props) {
  const { letter, outline } = usePalette();
  const isRightLayout = useIsRightLayout();
  const hides = useHideList();
  const isLoading = id == null && bpm == null && noteJumpSpeed == null;

  return (
    <div
      className={`text-[0.12em] h-[2.9989vw] flex items-center gap-[1em] transition-opacity`}
      style={{
        opacity: isLoading ? 0 : 1,
        flexDirection: isRightLayout ? "row-reverse" : undefined,
      }}
    >
      {!hides.has("id") && !!id && (
        <div className="flex items-center">
          <FaKey
            className="text-[0.8em] mr-[0.5em] [stroke-width:20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{id}</OutlinedParagraph>
        </div>
      )}
      {!hides.has("bpm") && !!bpm && (
        <div className="flex items-center">
          <FaDrum
            className="text-[0.9em] mr-[0.5em] [stroke-width:20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{Math.round(bpm * 10) / 10}</OutlinedParagraph>
        </div>
      )}
      {!hides.has("njs") && !!noteJumpSpeed && (
        <div className="flex items-center">
          <IoIosSpeedometer
            className="text-[1.0em] mr-[0.4em] [stroke-width:20%] overflow-visible [paint-order:stroke_fill]"
            stroke={outline}
            fill={letter}
          />
          <OutlinedParagraph>{Math.round(noteJumpSpeed * 10) / 10}</OutlinedParagraph>
        </div>
      )}
    </div>
  );
}
