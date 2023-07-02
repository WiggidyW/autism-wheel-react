import { ReactElement, ReactNode } from "react";
import {
  ButtonBase,
  Card,
  CardHeader,
  Typography,
  CardContent,
  Tooltip,
} from "@mui/material";

const SelectableCard = (props: {
  onSelect: () => void;
  tooltip?: ReactElement;
  children?: ReactNode;
}) => {
  const { onSelect, children, tooltip } = props;
  const inner = (
    <ButtonBase onClick={onSelect} sx={{ width: "100%" }}>
      <Card
        raised
        elevation={4}
        sx={{
          width: "100%",
          "&:hover": {
            backgroundColor: "primary.main",
            elevation: 12,
          },
        }}
      >
        {children}
      </Card>
    </ButtonBase>
  );
  return tooltip ? <Tooltip title={tooltip}>{inner}</Tooltip> : inner;
};

const CardTitle = (props: { title: string; children?: ReactNode }) => {
  const { title, children } = props;
  return (
    <CardHeader
      disableTypography
      title={
        <Typography variant="h6" noWrap>
          {title}
        </Typography>
      }
    >
      {children}
    </CardHeader>
  );
};

const PaddedCardContent = (props: { children?: ReactNode }) => {
  const { children } = props;
  return (
    <CardContent sx={{ padding: "8px", paddingBottom: "0px" }}>
      {children}
    </CardContent>
  );
};

export { SelectableCard, CardTitle, PaddedCardContent };
