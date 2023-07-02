import { ReactElement, useRef, useState } from "react";
import { Paper, Typography } from "@mui/material";
import { SizeKind, useSize } from "./Size";
import { NAV_BAR_HEIGHT, NavBar } from "./NavBar";
import { GradedSlice, User } from "./WheelData";

const Viewer = (props: { user: User; goBack: () => void }): ReactElement => {
  const { user, goBack } = props;
  const [slice, setSlice] = useState<GradedSlice | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <NavBar title={user.name} goBack={goBack} />
      <div
        ref={viewRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: `calc(100% - ${NAV_BAR_HEIGHT}px)`,
          width: "100%",
          marginTop: `${NAV_BAR_HEIGHT}px`,
        }}
      >
        <Paper>
          {user.preview(SizeKind.view, viewRef, setSlice, user.name)}
        </Paper>
        <ViewerDescription
          sizeKind={SizeKind.view}
          viewRef={viewRef}
          items={(() => {
            const items = [];
            if (slice?.desc)
              items.push({ title: slice.name, desc: slice.desc });
            if (slice?.gradeDesc)
              items.push({ title: user.name, desc: slice.gradeDesc });
            if (items.length === 0)
              items.push({ title: "", desc: "Click on a slice!" });
            return items;
          })()}
        />
      </div>
    </>
  );
};

const ViewerDescription = (props: {
  items: {
    title: string;
    desc: string;
  }[];
  sizeKind: SizeKind;
  viewRef?: React.RefObject<Element>;
}): ReactElement | null => {
  const { items, sizeKind, viewRef } = props;
  const size = useSize(sizeKind, viewRef);
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: "8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper sx={{ padding: "8px" }}>
        {items.map((item, i) => (
          <Paper
            key={item.title}
            elevation={4}
            sx={{ padding: "8px", marginTop: i === 0 ? "0px" : "8px" }}
          >
            <Typography variant={"h6"}>{item.title}</Typography>
            <Typography>{item.desc}</Typography>
          </Paper>
        ))}
      </Paper>
    </div>
  );
};

export default Viewer;
