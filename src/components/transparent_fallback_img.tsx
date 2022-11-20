import { DetailedHTMLProps, ImgHTMLAttributes, useEffect, useState } from "react";

export function TransparentFallbackImg({
  src,
  ...props
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  const transparent =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const [state, setState] = useState({ hasError: false });

  useEffect(() => {
    setState({ ...state, hasError: false });
  }, [src]);

  return (
    <img
      onError={() => {
        setState({ hasError: true });
      }}
      src={state.hasError ? transparent : src}
      {...props}
    />
  );
}
