import { RefObject, useEffect, useState } from "react";

const AVATAR_SIZE = 50;

type ViewRef = RefObject<Element>;

const viewSize = (viewRef?: ViewRef): number => {
  let width: number, height: number;
  if (viewRef?.current) {
    width = viewRef.current.clientWidth;
    height = viewRef.current.clientHeight;
  } else {
    width = window.innerWidth;
    height = window.innerHeight;
  }
  if (width > height) return Math.min(height, 0.5 * width);
  /*if (height >= width)*/ else return Math.min(width, 0.5 * height);
};

const select = (viewRef?: ViewRef): number => viewSize(viewRef) * 0.3;
const full = (viewRef?: ViewRef): number => viewSize(viewRef) * 0.8;
const view = (viewRef?: ViewRef): number => viewSize(viewRef);

enum SizeKind {
  avatar,
  select,
  full,
  view,
}

const intoNumber = (size: SizeKind, viewRef?: ViewRef): number => {
  switch (size) {
    case SizeKind.avatar:
      return AVATAR_SIZE;
    case SizeKind.select:
      return select(viewRef);
    case SizeKind.full:
      return full(viewRef);
    case SizeKind.view:
      return view(viewRef);
  }
};

const fontSize = (size: SizeKind): string | null => {
  switch (size) {
    case SizeKind.avatar:
      return null;
    case SizeKind.select:
      return null;
    case SizeKind.full:
      return "1.25em";
    case SizeKind.view:
      return "1.5em";
  }
};

const isDynamic = (size: SizeKind): boolean => {
  switch (size) {
    case SizeKind.avatar:
      return false;
    case SizeKind.select:
      return true;
    case SizeKind.full:
      return true;
    case SizeKind.view:
      return true;
  }
};

const useSize = (sizeKind: SizeKind, viewRef?: ViewRef): number => {
  const [thisSize, setThisSize] = useState(() => intoNumber(sizeKind, viewRef));

  if (isDynamic(sizeKind) && viewRef && !viewRef.current) {
    setTimeout(() => setThisSize(intoNumber(sizeKind, viewRef)), 1);
  }

  useEffect(() => {
    const handleResize = () => setThisSize(intoNumber(sizeKind, viewRef));

    if (isDynamic(sizeKind)) {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return thisSize;
};

export { SizeKind, fontSize, useSize };
