import { ArrowBack } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { ReactElement, ReactNode } from "react";

const NAV_BAR_HEIGHT = 64;

const NavBar = (props: {
  setTitle?: (t: string) => void;
  title: string;
  goBack?: () => void;
  children?: ReactNode;
}): ReactElement => {
  const { title, setTitle, goBack, children } = props;
  return (
    <AppBar
      position="fixed"
      sx={{ height: `${NAV_BAR_HEIGHT}px`, alignSelf: "flex-start" }}
    >
      <Toolbar>
        {goBack && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={goBack}
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography
          variant="h6"
          sx={{
            display: "flex",
            flex: "1",
            alignItems: "center",
            justifyContent: "center",
          }}
          component="div"
        >
          {setTitle ? (
            <EditableTitle title={title} setTitle={setTitle} />
          ) : (
            <StaticTitle title={title} />
          )}
        </Typography>
        {children}
      </Toolbar>
    </AppBar>
  );
};

const EditableTitle = (props: {
  title: string;
  setTitle: (t: string) => void;
}) => (
  <div
    suppressContentEditableWarning={true}
    contentEditable={true}
    onBlur={(e) => props.setTitle(e.currentTarget.innerText.trim())}
  >
    {props.title}
  </div>
);

const StaticTitle = (props: { title: string }) => <div>{props.title}</div>;

export { NavBar, NAV_BAR_HEIGHT };
