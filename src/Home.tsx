import { ReactElement, ReactNode } from "react";
import { Unstable_Grid2 as Grid, Typography } from "@mui/material";
import ImageBackupData from "./assets/BackupData.png";
import ImageImportData from "./assets/ImportData.png";
import ImageCreateSlices from "./assets/CreateSlices.png";
import ImageCreateTemplates from "./assets/CreateTemplates.png";
import ImageCreateUsers from "./assets/CreateUsers.png";
import ImageViewUsers from "./assets/ViewUsers.png";
import ImageManageData from "./assets/ManageData.png";
import ImageResetData from "./assets/ResetData.png";
import ImageGoHome from "./assets/GoHome.png";
import { CardTitle, PaddedCardContent, SelectableCard } from "./MuiExt";

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
  <HomeContainer>
    <SelectorItem
      title="Create Slices"
      description="Create slices."
      onSelect={() => props.onSelect(HomeSelection.CreateSlices)}
      image={ImageCreateSlices}
    />
    <SelectorItem
      title="Create Templates"
      description="Create templates from slices."
      onSelect={() => props.onSelect(HomeSelection.CreateTemplates)}
      image={ImageCreateTemplates}
    />
    <SelectorItem
      title="Create Wheels"
      description="Create wheels from templates."
      onSelect={() => props.onSelect(HomeSelection.CreateUsers)}
      image={ImageCreateUsers}
    />
    <SelectorItem
      title="Manage Data"
      description="Manage your data for this website."
      onSelect={() => props.onSelect(HomeSelection.ManageData)}
      image={ImageManageData}
    />
    <SelectorItem
      title="View Wheels"
      description="View wheels."
      onSelect={() => props.onSelect(HomeSelection.ViewUsers)}
      image={ImageViewUsers}
    />
  </HomeContainer>
);

const DataHome = (props: {
  onSelect: (s: DataHomeSelection) => void;
}): ReactElement => (
  <HomeContainer>
    <SelectorItem
      title="Go Home"
      description="Go back to the home screen."
      onSelect={() => props.onSelect(DataHomeSelection.GoHome)}
      image={ImageGoHome}
    />
    <SelectorItem
      title="Backup Data"
      description="Backup all of your data to a file."
      onSelect={() => props.onSelect(DataHomeSelection.Backup)}
      image={ImageBackupData}
    />
    <SelectorItem
      title="Import Data"
      description="Import your data from a file."
      onSelect={() => props.onSelect(DataHomeSelection.Import)}
      image={ImageImportData}
    />
    <SelectorItem
      title="Reset Data"
      description="Reset all of your data."
      onSelect={() => props.onSelect(DataHomeSelection.Reset)}
      image={ImageResetData}
    />
  </HomeContainer>
);

const HomeContainer = (props: { children: ReactNode }) => {
  const { children } = props;
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent={"center"}
        alignItems={"center"}
        width={"100%"}
        sx={{ "& .MuiCardContent-root:last-child": { paddingBottom: "8px" } }}
      >
        {children}
      </Grid>
    </div>
  );
};

const SelectorItem = (props: {
  title: string;
  description: string;
  onSelect: () => void;
  image: string;
}): ReactElement => {
  const { title, description, onSelect, image } = props;
  return (
    <Grid>
      <SelectableCard
        onSelect={onSelect}
        tooltip={<Typography>{description}</Typography>}
      >
        <CardTitle title={title} />
        <PaddedCardContent>
          <img src={image} alt={title} />
        </PaddedCardContent>
      </SelectableCard>
    </Grid>
  );
};

export { Home, HomeSelection, DataHome, DataHomeSelection };
