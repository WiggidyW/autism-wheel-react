import { ReactElement, RefObject } from "react";
import { GradedSlice } from "./WheelData";
import { Avatar } from "@mui/material";
import { SizeKind } from "./Size";

interface Previewable {
  preview: (
    sizeKind: SizeKind,
    viewRef?: RefObject<Element>,
    onClick?: (slice: GradedSlice) => void,
    fileName?: string
  ) => ReactElement;
  previewDesc?: () => ReactElement | undefined;
}

const PreviewAvatar = (props: { previewable: Previewable }): ReactElement => {
  const { previewable } = props;
  return <Avatar>{previewable.preview(SizeKind.avatar)}</Avatar>;
};

export type { Previewable };
export { PreviewAvatar };
