import { ReactElement, ReactNode } from "react";
import { Unstable_Grid2 as Grid, Typography } from "@mui/material";
import { CardTitle, PaddedCardContent, SelectableCard } from "./MuiExt";
import { NAV_BAR_HEIGHT, NavBar } from "./NavBar";
import {
  Clear,
  DataObject,
  Download,
  Looks3,
  LooksOne,
  LooksTwo,
  Upload,
  Visibility,
} from "@mui/icons-material";

enum HomeSelection {
  ManageData,
  CreateSlices,
  CreateTemplates,
  CreateUsers,
  ViewUsers,
}

enum DataHomeSelection {
  Backup,
  Import,
  Reset,
  GoHome,
}

const Home = (props: {
  onSelect: (s: HomeSelection) => void;
}): ReactElement => (
  <HomeContainer title={"Home"}>
    <SelectorItem
      title="Create Slices"
      description="Create slices."
      onSelect={() => props.onSelect(HomeSelection.CreateSlices)}
    >
      <LooksOne style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="Create Templates"
      description="Create templates from slices."
      onSelect={() => props.onSelect(HomeSelection.CreateTemplates)}
    >
      <LooksTwo style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="Create Wheels"
      description="Create wheels from templates."
      onSelect={() => props.onSelect(HomeSelection.CreateUsers)}
    >
      <Looks3 style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="View Wheels"
      description="View wheels."
      onSelect={() => props.onSelect(HomeSelection.ViewUsers)}
    >
      <Visibility style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="Manage Data"
      description="Manage your data for this website."
      onSelect={() => props.onSelect(HomeSelection.ManageData)}
    >
      <DataObject style={{ transform: "scale(1.5)" }} />{" "}
    </SelectorItem>
  </HomeContainer>
);

const DataHome = (props: {
  onSelect: (s: DataHomeSelection) => void;
}): ReactElement => (
  <HomeContainer
    title={"Manage Data"}
    goBack={() => props.onSelect(DataHomeSelection.GoHome)}
  >
    <SelectorItem
      title="Backup Data"
      description="Backup all of your data to a file."
      onSelect={() => props.onSelect(DataHomeSelection.Backup)}
    >
      <Download style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="Import Data"
      description="Import your data from a file."
      onSelect={() => props.onSelect(DataHomeSelection.Import)}
    >
      <Upload style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
    <SelectorItem
      title="Reset Data"
      description="Reset all of your data."
      onSelect={() => props.onSelect(DataHomeSelection.Reset)}
    >
      <Clear style={{ transform: "scale(1.5)" }} />
    </SelectorItem>
  </HomeContainer>
);

const HomeContainer = (props: {
  children: ReactNode;
  title: string;
  goBack?: () => void;
}) => {
  const { children, title, goBack } = props;
  return (
    <>
      <NavBar title={title} goBack={goBack} />
      <Grid
        container
        spacing={2}
        justifyContent={"center"}
        alignItems={"center"}
        height={`calc(100% - ${NAV_BAR_HEIGHT}px)`}
        width={"100%"}
        marginTop={`${NAV_BAR_HEIGHT - 8}px`}
        sx={{ "& .MuiCardContent-root:last-child": { paddingBottom: "8px" } }}
      >
        {children}
      </Grid>
    </>
  );
};

const SelectorItem = (props: {
  title: string;
  description: string;
  onSelect: () => void;
  children?: ReactNode;
}): ReactElement => {
  const { title, description, onSelect, children } = props;
  return (
    <Grid>
      <SelectableCard
        onSelect={onSelect}
        tooltip={<Typography>{description}</Typography>}
      >
        <CardTitle title={title} />
        <PaddedCardContent>{children}</PaddedCardContent>
      </SelectableCard>
    </Grid>
  );
};

export { Home, HomeSelection, DataHome, DataHomeSelection };
