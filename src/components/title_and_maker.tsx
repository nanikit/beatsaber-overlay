import { RefObject, useRef } from "react";
import { useWindowSize } from "react-use";
import { useIsRightLayout } from "../hooks/search_param_hooks";
import { useTextFit } from "../hooks/use_text_fit";
import { OutlinedParagraph } from "./outlined_paragraph";

type Props = {
  title?: string;
  subtitle?: string;
  artist?: string;
  mapper?: string;
};

export function TitleAndMaker({ title, subtitle, artist, mapper }: Props) {
  const { width: vw100 } = useWindowSize();

  const titleRef = useRef<HTMLParagraphElement>(null);
  useTextFit({
    ref: titleRef as RefObject<HTMLElement>,
    maxHeight: vw100 * 0.09,
    maxSize: vw100 * 0.038,
  });

  const authorRef = useRef<HTMLParagraphElement>(null);
  useTextFit({
    ref: authorRef as RefObject<HTMLElement>,
    maxHeight: vw100 * 0.04,
    maxSize: vw100 * 0.0225,
  });

  const isRightLayout = useIsRightLayout();

  return (
    <>
      <div
        ref={titleRef}
        className={`flex flex-wrap justify-end gap-[0_0.4em] leading-none ${
          isRightLayout ? "flex-row items-start" : "flex-row-reverse items-end"
        }`}
      >
        <OutlinedParagraph className="text-[0.5em] leading-[1.4]">
          {subtitle ?? ""}
        </OutlinedParagraph>
        <OutlinedParagraph>{title ?? ""}</OutlinedParagraph>
      </div>
      <OutlinedParagraph ref={authorRef} className="text-[0.16em] mt-[0.3em]">
        {artist ?? ""} [{mapper ?? ""}]
      </OutlinedParagraph>
    </>
  );
}
