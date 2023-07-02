import { ReactElement, useRef, useState } from "react";
import { GradedSlice, Slice, SliceGrade, Template, User } from "./WheelData";
import {
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  IconButton,
  TableBody,
  TableCell,
  TextField,
  TableRow,
  Slider,
  Paper,
  Table,
  List,
  Tooltip,
  Typography,
} from "@mui/material";
import { SizeKind } from "./Size";
import { Replay, Save } from "@mui/icons-material";
import { HexColorPicker } from "react-colorful";
import { NavBar, NAV_BAR_HEIGHT } from "./NavBar";
import { Selectable } from "./Selector";
import { PreviewAvatar } from "./Preview";

const DEF_GRADE: SliceGrade = 0;
const MIN_GRADE: SliceGrade = 0;
const MAX_GRADE: SliceGrade = 10;

interface Editable extends Selectable {
  toStorage: () => void;
  deepClone: () => this;
  clone: () => this;
}

interface EditorExtension<E, V> {
  mutate: (editable: E, v: V) => void;
  render: (onChange: (v: V) => void) => ReactElement;
}

interface EditorProps<E> {
  initial: E;
  editable: E;
  setEditable: (e: E) => void;
  goBack: () => void;
  extensions: EditorExtension<E, any>[];
}

const Editor = <E extends Editable>(props: EditorProps<E>): ReactElement => {
  const { initial, editable, setEditable, goBack, extensions } = props;
  const viewRef = useRef<HTMLDivElement>(null);
  return (
    <>
      <NavBar
        title={editable.name}
        setTitle={(t: string) => {
          editable.name = t;
          setEditable(editable.clone());
        }}
        goBack={goBack}
      >
        <IconButton
          // edge="center"
          key="nav-bar-reset"
          color="inherit"
          aria-label="reset"
          onClick={() => {
            setEditable(initial.deepClone());
          }}
        >
          <Replay />
        </IconButton>
        <IconButton
          key="nav-bar-save"
          edge="end"
          color="inherit"
          aria-label="save"
          onClick={() => {
            editable.toStorage();
            goBack();
          }}
        >
          <Save />
        </IconButton>
      </NavBar>
      <div
        style={{
          marginTop: `${NAV_BAR_HEIGHT}px`,
          display: "flex",
          width: "100%",
          height: `calc(100% - ${NAV_BAR_HEIGHT}px)`,
          justifyContent: "space-evenly",
          placeItems: "center",
        }}
        ref={viewRef}
      >
        <Paper>{editable.preview(SizeKind.full, viewRef)}</Paper>
        {extensions.map((e: EditorExtension<E, any>) =>
          e.render((v) => {
            e.mutate(editable, v);
            setEditable(editable.clone());
          })
        )}
      </div>
    </>
  );
};

const useEditor = <E extends Editable>(
  initEditable: E,
  goBack: () => void
): [E, EditorProps<E>] => {
  const [thisEditable, setThisEditable] = useState(() =>
    initEditable.deepClone()
  );
  return [
    thisEditable,
    {
      initial: initEditable,
      editable: thisEditable,
      setEditable: setThisEditable,
      goBack: goBack,
      extensions: [],
    },
  ];
};

const SliceEditor = (props: {
  slice: Slice;
  goBack: () => void;
}): ReactElement => {
  const { slice, goBack } = props;
  const [_, editorProps] = useEditor(slice, goBack);
  const extensions = [
    {
      mutate: (slice: Slice, v: string) => (slice.color = v),
      render: (onChange: (v: string) => void) => (
        <ColorPicker
          key="color-picker"
          width={"20em"}
          height={"20em"}
          color={slice.colorObj.hex()}
          setColor={onChange}
        />
      ),
    },
    {
      mutate: (slice: Slice, v?: string) => (slice.desc = v),
      render: (onChange: (v?: string) => void) => (
        <Paper sx={{ padding: "8px" }} key="description-editor">
          <DescriptionEditor
            description={slice.desc}
            setDescription={onChange}
            width={"20em"}
            tooltip={
              <Typography>{`describe what '${slice.name}' is`}</Typography>
            }
          />
        </Paper>
      ),
    },
  ];
  return <Editor {...editorProps} extensions={extensions} />;
};

const TemplateEditor = (props: {
  template: Template;
  slices: Slice[];
  goBack: () => void;
}): ReactElement => {
  const { template, slices, goBack } = props;
  const [_, editorProps] = useEditor(template, goBack);
  const extensions = [
    {
      mutate: (template: Template, v: Slice) => template.setSlice(v),
      render: (onChange: (v: Slice) => void) => (
        <SlicePicker key="slice-picker" slices={slices} setSlice={onChange} />
      ),
    },
  ];
  return <Editor {...editorProps} extensions={extensions} />;
};

const UserEditor = (props: {
  user: User;
  templates: Template[];
  goBack: () => void;
}): ReactElement => {
  const { user, templates, goBack } = props;
  const [thisUser, editorProps] = useEditor(user, goBack);
  const extensions = [
    {
      mutate: (user: User, v: Template) => user.setTemplate(v, DEF_GRADE),
      render: (onChange: (v: Template) => void) => (
        <TemplatePicker
          key="template-picker"
          templates={templates}
          setTemplate={onChange}
        />
      ),
    },
    {
      mutate: (user: User, v: GradedSlice[]) => (user.slices = v),
      render: (onChange: (v: GradedSlice[]) => void) => (
        <GradedSliceForm
          key="graded-slice-form"
          slices={thisUser.slices}
          setSlices={onChange}
          userName={thisUser.name}
        />
      ),
    },
  ];
  return <Editor {...editorProps} extensions={extensions} />;
};

const ColorPicker = (props: {
  color: string;
  setColor: (c: string) => void;
  width: string;
  height: string;
}): ReactElement => {
  const { color, setColor, width, height } = props;
  const [value, setValue] = useState(color);
  return (
    <Tooltip title={<Typography>{"select a color"}</Typography>}>
      <div>
        <HexColorPicker
          style={{ width: width, height: height }}
          color={value}
          onChange={(c) => {
            setValue(c);
            setColor(c);
          }}
        />
      </div>
    </Tooltip>
  );
};

const EditablePicker = <E extends Editable>(props: {
  editables: E[];
  setEditable: (e: E) => void;
  keyName: string;
}): ReactElement => {
  const { editables, setEditable, keyName } = props;
  return (
    <Paper
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <List>
        {editables.map((editable) => (
          <ListItemButton
            key={`${keyName}-${editable.name}`}
            // button
            onClick={() => setEditable(editable)}
          >
            <ListItemAvatar>
              <PreviewAvatar previewable={editable} />
            </ListItemAvatar>
            <ListItemText primary={editable.name} />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
};

const SlicePicker = (props: {
  slices: Slice[];
  setSlice: (s: Slice) => void;
}) => {
  const { slices, setSlice } = props;
  return (
    <EditablePicker
      editables={slices}
      setEditable={setSlice}
      keyName="slicepicker"
    />
  );
};

const TemplatePicker = (props: {
  templates: Template[];
  setTemplate: (t: Template) => void;
}) => {
  const { templates, setTemplate } = props;
  return (
    <EditablePicker
      editables={templates}
      setEditable={setTemplate}
      keyName="templatepicker"
    />
  );
};

const GradedSliceForm = (props: {
  slices: GradedSlice[];
  setSlices: (gs: GradedSlice[]) => void;
  userName: string;
}) => {
  const { slices, setSlices, userName } = props;
  return (
    <Paper
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Table>
        <TableBody>
          {slices.map((gs, i) => (
            <TableRow key={`gs-form-${gs.name}`}>
              <TableCell>{gs.name}</TableCell>
              <TableCell>
                <PreviewAvatar previewable={gs} />
              </TableCell>
              <TableCell>
                <GradeSlider
                  width="10em"
                  grade={gs.grade}
                  setGrade={(g) => {
                    slices[i].grade = g;
                    setSlices(slices);
                  }}
                />
              </TableCell>
              <TableCell>
                <DescriptionEditor
                  width="20em"
                  description={gs.gradeDesc}
                  setDescription={(d) => {
                    slices[i].gradeDesc = d;
                    setSlices(slices);
                  }}
                  tooltip={
                    <Typography>
                      {`describe what this level of '${gs.name}'` +
                        ` means for '${userName}'`}
                    </Typography>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

const useFormSync = <T,>(initValue: T): [T, (t: T) => void] => {
  // Maintain a local state to avoid excessive rerenders
  const [thisValue, setThisValue] = useState(initValue);
  const [prevValue, setPrevValue] = useState(initValue);

  // Reset thisValue when the initial value changes
  // This syncs the visible value with the object's value when it changes
  if (prevValue !== initValue) {
    setPrevValue(initValue);
    if (thisValue !== initValue) {
      setThisValue(initValue);
    }
  }

  return [thisValue, setThisValue];
};

const GradeSlider = (props: {
  grade: SliceGrade;
  setGrade: (g: SliceGrade) => void;
  width: string;
}) => {
  const { grade: initGrade, setGrade, width } = props;
  const [thisGrade, setThisGrade] = useFormSync(initGrade);
  return (
    <div style={{ width: width }}>
      <Slider
        value={thisGrade}
        onChange={(_, v) => setThisGrade(v as SliceGrade)}
        onChangeCommitted={() => {
          if (thisGrade !== initGrade) setGrade(thisGrade);
        }}
        step={1}
        marks
        min={MIN_GRADE}
        max={MAX_GRADE}
        valueLabelDisplay="auto"
      />
    </div>
  );
};

const DescriptionEditor = (props: {
  description?: string;
  setDescription: (d?: string) => void;
  width: string;
  tooltip: ReactElement;
}) => {
  const { description: initDesc, setDescription, tooltip, width } = props;
  const [thisDesc, setThisDesc] = useFormSync(initDesc);
  return (
    <Tooltip title={tooltip}>
      <div style={{ width: width }}>
        <TextField
          id="outlined-multiline-basic"
          label={"Description"}
          variant="outlined"
          value={thisDesc || ""}
          onChange={(e) => setThisDesc(e.target.value)}
          onBlur={() => {
            let newDesc: string | undefined;
            newDesc = thisDesc?.trim();
            newDesc = newDesc === "" ? undefined : newDesc;
            if (newDesc !== initDesc) setDescription(newDesc);
          }}
          fullWidth
          multiline
        />
      </div>
    </Tooltip>
  );
};

export { SliceEditor, TemplateEditor, UserEditor };
