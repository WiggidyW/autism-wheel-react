import { useState } from "react";
import "./App.css";
import { Slice, Template, User } from "./WheelData";
import Selector from "./Selector";
import { SliceEditor, TemplateEditor, UserEditor } from "./Editor";
import { DataHome, DataHomeSelection, Home, HomeSelection } from "./Home";
import { downloadStored, resetStored, uploadStored } from "./WheelStorage";
import Viewer from "./Viewer";
import { Paper, Typography } from "@mui/material";

class NavHome {}
class NavDataHome {}
class NavSelectEditSlice {}
class NavEditSlice {
  constructor(public slice: Slice) {}
}
class NavSelectEditTemplate {}
class NavEditTemplate {
  constructor(public template: Template) {}
}
class NavSelectEditUser {}
class NavEditUser {
  constructor(public user: User) {}
}
class NavSelectViewUser {}
class NavViewUser {
  constructor(public user: User) {}
}

type NavLocation =
  | NavHome
  | NavDataHome
  | NavSelectEditSlice
  | NavEditSlice
  | NavSelectEditTemplate
  | NavEditTemplate
  | NavSelectEditUser
  | NavEditUser
  | NavSelectViewUser
  | NavViewUser;

const App = () => {
  const [navLocation, setNavLocation] = useState<NavLocation>(new NavHome());

  if (navLocation instanceof NavHome) {
    return (
      <Home
        onSelect={(s: HomeSelection) => {
          switch (s) {
            case HomeSelection.ManageData:
              setNavLocation(new NavDataHome());
              break;
            case HomeSelection.CreateSlices:
              setNavLocation(new NavSelectEditSlice());
              break;
            case HomeSelection.CreateTemplates:
              setNavLocation(new NavSelectEditTemplate());
              break;
            case HomeSelection.CreateUsers:
              setNavLocation(new NavSelectEditUser());
              break;
            case HomeSelection.ViewUsers:
              setNavLocation(new NavSelectViewUser());
              break;
          }
        }}
      />
    );
  } else if (navLocation instanceof NavDataHome) {
    return (
      <DataHome
        onSelect={(s: DataHomeSelection) => {
          switch (s) {
            case DataHomeSelection.Backup:
              downloadStored();
              break;
            case DataHomeSelection.Import:
              uploadStored();
              break;
            case DataHomeSelection.Reset:
              resetStored();
              break;
            case DataHomeSelection.GoHome:
              setNavLocation(new NavHome());
              break;
          }
        }}
      />
    );
  } else if (navLocation instanceof NavSelectEditSlice) {
    return (
      <Selector
        itemKind="Slice"
        selectables={Slice.fromStorage()}
        goBack={() => setNavLocation(new NavHome())}
        onCreate={() => setNavLocation(new NavEditSlice(Slice.default()))}
        onSelect={(s: Slice) => setNavLocation(new NavEditSlice(s))}
        titledItems
        deletable
      />
    );
  } else if (navLocation instanceof NavEditSlice) {
    return (
      <SliceEditor
        slice={navLocation.slice}
        goBack={() => setNavLocation(new NavSelectEditSlice())}
      />
    );
  } else if (navLocation instanceof NavSelectEditTemplate) {
    return (
      <Selector
        itemKind="Template"
        selectables={Template.fromStorage()}
        goBack={() => setNavLocation(new NavHome())}
        onCreate={() => setNavLocation(new NavEditTemplate(Template.default()))}
        onSelect={(t: Template) => setNavLocation(new NavEditTemplate(t))}
        onEmpty={() => <OnEmptyCard text={"Create some Slices first!"} />}
        titledItems
        deletable
      />
    );
  } else if (navLocation instanceof NavEditTemplate) {
    return (
      <TemplateEditor
        template={navLocation.template}
        slices={Slice.fromStorage()}
        goBack={() => setNavLocation(new NavSelectEditTemplate())}
      />
    );
  } else if (navLocation instanceof NavSelectEditUser) {
    return (
      <Selector
        itemKind="Wheel"
        selectables={User.fromStorage()}
        goBack={() => setNavLocation(new NavHome())}
        onCreate={() => setNavLocation(new NavEditUser(User.default()))}
        onSelect={(u: User) => setNavLocation(new NavEditUser(u))}
        onEmpty={() => <OnEmptyCard text={"Create some Templates first!"} />}
        titledItems
        deletable
      />
    );
  } else if (navLocation instanceof NavEditUser) {
    return (
      <UserEditor
        user={navLocation.user}
        templates={Template.fromStorage()}
        goBack={() => setNavLocation(new NavSelectEditUser())}
      />
    );
  } else if (navLocation instanceof NavSelectViewUser) {
    return (
      <Selector
        itemKind="Wheel"
        selectables={User.fromStorage()}
        goBack={() => setNavLocation(new NavHome())}
        onSelect={(u: User) => setNavLocation(new NavViewUser(u))}
        onEmpty={() => <OnEmptyCard text={"Create some Wheels first!"} />}
        titledItems
      />
    );
  } else if (navLocation instanceof NavViewUser) {
    return (
      <Viewer
        user={navLocation.user}
        goBack={() => setNavLocation(new NavSelectViewUser())}
      />
    );
  }
};

const OnEmptyCard = (props: { text: string }) => (
  <Paper sx={{ padding: "8px" }}>
    <Typography variant={"h6"}>{props.text}</Typography>
  </Paper>
);

export default App;
