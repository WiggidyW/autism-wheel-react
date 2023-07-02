import { ReactElement, RefObject, createRef } from "react";
import { Arc } from "@visx/shape";
import { Group } from "@visx/group";
import { GradedSlice } from "./WheelData";
import Color from "color";
import { SizeKind, fontSize as getFontSize, useSize } from "./Size";
import { IconButton } from "@mui/material";
import { Save } from "@mui/icons-material";

const PNG_IMAGE_SIZE = 1024;
const MAX_GRADE = 10;
const FILL_RATIO = 0.92;
const FILL_PER_SPACE = 2;
const ANGLE_PADDING = 0.05;

const Wheel = (props: {
  slices: GradedSlice[];
  sizeKind: SizeKind;
  viewRef?: RefObject<Element>;
  onClick?: (slice: GradedSlice) => void;
  fileName?: string;
}): ReactElement => {
  const { slices, sizeKind, viewRef, onClick, fileName } = props;

  const size = useSize(sizeKind, viewRef);
  const svgRef = createRef<SVGSVGElement>();

  const radiusIntvl = (2 * Math.PI) / slices.length;
  const startRadius = Math.floor(size / 25);
  const gradeRadius = Math.max(2, Math.floor((size - 2 * startRadius) / 20));
  const fillRadius = Math.max(2, Math.floor(gradeRadius * FILL_RATIO) + 1);

  const radiums = new Array<[number, number][]>(Math.ceil(MAX_GRADE / 2));

  for (let ri = 0; ri < radiums.length; ri++) {
    const gradeRadiums = new Array<[number, number]>(FILL_PER_SPACE);
    for (let gi = 0; gi < gradeRadiums.length; gi++) {
      const riRadius = ri * gradeRadius * FILL_PER_SPACE;
      gradeRadiums[gi] = [
        startRadius + riRadius + gi * fillRadius,
        startRadius + riRadius + (gi + 1) * fillRadius,
      ];
    }
    radiums[ri] = gradeRadiums;
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {fileName === undefined ? null : (
        <IconButton
          sx={{ position: "absolute", top: 0, right: 0 }}
          onClick={() => {
            const svg = svgRef.current;
            if (svg) {
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement("canvas");
              canvas.width = PNG_IMAGE_SIZE;
              canvas.height = PNG_IMAGE_SIZE;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, PNG_IMAGE_SIZE, PNG_IMAGE_SIZE);
                  const a = document.createElement("a");
                  a.download = `${fileName}.png`;
                  a.href = canvas.toDataURL("image/png");
                  a.click();
                };
                img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
              }
            }
          }}
        >
          <Save />
        </IconButton>
      )}
      <svg width={size} height={size} ref={svgRef}>
        <Group top={size / 2} left={size / 2}>
          {slices.map((slice, i) => (
            <WheelArc
              key={`wheel-${slice.key}`}
              slice={slice}
              radiums={radiums}
              fillRadius={fillRadius}
              gradeRadius={gradeRadius}
              sizeKind={sizeKind}
              onClick={onClick}
              startAngle={
                slices.length > 1
                  ? i * radiusIntvl + ANGLE_PADDING / 2
                  : i * radiusIntvl
              }
              endAngle={
                slices.length > 1
                  ? (i + 1) * radiusIntvl - ANGLE_PADDING / 2
                  : (i + 1) * radiusIntvl
              }
            />
          ))}
        </Group>
      </svg>
    </div>
  );
};

const WheelArc = (props: {
  slice: GradedSlice;
  radiums: [number, number][][];
  gradeRadius: number;
  fillRadius: number;
  startAngle: number;
  endAngle: number;
  sizeKind: SizeKind;
  onClick?: (slice: GradedSlice) => void;
}): ReactElement => {
  const {
    slice,
    radiums,
    gradeRadius,
    fillRadius,
    startAngle,
    endAngle,
    sizeKind,
    onClick,
  } = props;

  const endRadius =
    radiums[0][0][0] + (slice.grade - 1) * gradeRadius + fillRadius;

  const innerArcs = (): ReactElement[] => {
    const arcs = new Array<ReactElement>(radiums.length + 1);
    let fillEmpty = false;
    let i = 0;

    const nextArc = (innerRadius: number, outerRadius: number): void => {
      arcs[i] = (
        <Arc
          key={`wheel-${slice.key}-${i}`}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          cornerRadius={3}
          stroke={fillEmpty ? "black" : undefined}
          fill={fillEmpty ? "none" : TransformColor(i, slice.color)}
        />
      );
      i++;
    };

    for (let ri = 0; ri < radiums.length; ri++) {
      const gradeRadiums = radiums[ri];
      const innerRadius = gradeRadiums[0][0];
      const outerRadius = gradeRadiums.slice(-1)[0][1];

      if (!fillEmpty && outerRadius >= endRadius) {
        nextArc(innerRadius, endRadius);
        fillEmpty = true;
        if (outerRadius > endRadius) nextArc(endRadius, outerRadius);
      } else {
        nextArc(innerRadius, outerRadius);
      }
    }

    return arcs;
  };

  const fontSize = getFontSize(sizeKind);

  return fontSize === null ? (
    <>{innerArcs()}</>
  ) : (
    <Arc
      innerRadius={radiums[0][0][0]}
      outerRadius={radiums.slice(-1)[0].slice(-1)[0][1]}
      startAngle={startAngle}
      endAngle={endAngle}
    >
      {({ path }) => (
        <>
          {innerArcs()}
          <defs>
            <filter
              x="0"
              y="0"
              width="1px"
              height="1px"
              id={`${slice.key}-solidtext`}
            >
              <feFlood
                className="wheel-text-bg"
                floodColor={"#000000"}
                floodOpacity={0.75}
                result="bg"
              />
              <feMerge>
                <feMergeNode in="bg" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/*
            Stylesheet properties won't be applied to downloaded images.
          */}
          <text
            onClick={onClick ? () => onClick(slice) : undefined}
            filter={`url(#${slice.key}-solidtext)`}
            x={path.centroid(path)[0]}
            y={path.centroid(path)[1]}
            className={"wheel-text"}
            fontSize={fontSize}
            dy={".33em"}
            textAnchor={"middle"}
            fill={"#ffffff"}
            // style={{
            //   textShadow: "0 0 4px #000000",
            // }}
          >
            {slice.name}
          </text>
        </>
      )}
    </Arc>
  );
};

const TransformColor = (idx: number, color: string | Color): string => {
  switch (idx) {
    case 0:
      return Color(color).mix(Color("white"), 0.8).hex();
    case 1:
      return Color(color).mix(Color("white"), 0.55).hex();
    case 2:
      return Color(color).mix(Color("white"), 0.35).hex();
    case 3:
      return Color(color).mix(Color("white"), 0.175).hex();
    default:
      if (color instanceof Color) return color.hex();
      else return color;
  }
};

export { Wheel };
