import Color from "color";
import { ReactElement, RefObject } from "react";
import { Typography } from "@mui/material";
import { SizeKind } from "./Size";
import { Wheel } from "./Wheel";
import {
  SLICES_KEY,
  TEMPLATES_KEY,
  USERS_KEY,
  getStored,
  setStored,
} from "./WheelStorage";

type SliceGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

class StorageSlice {
  public name: string;
  public color: string;
  public desc?: string;

  constructor(name: string, color: string, desc?: string) {
    this.name = name;
    this.color = color;
    this.desc = desc;
  }

  static fromStorage = (): Map<string, StorageSlice> =>
    getStored<StorageSlice>(SLICES_KEY, (o: any) =>
      Object.assign(this.default(), o)
    );

  static default = (): StorageSlice => new StorageSlice("", "");

  intoSlice = (): Slice => new Slice(this.color, this.name, this.desc);
}

class Slice {
  private initialName: string;

  public name: string;
  public key: string;
  public color: string;
  public desc?: string;

  public get colorObj(): Color {
    return Color(this.color);
  }

  constructor(
    color: string,
    name: string,
    desc?: string,
    initialName?: string
  ) {
    this.initialName = initialName ? initialName : name;
    this.name = name;
    this.key = name.toLowerCase().replace(/ /g, "_");
    this.color = color;
    this.desc = desc;
    // console.log(this.key);
  }

  static default = (): Slice => new Slice("#ffffff", "untitled");

  // static fromStorage = (): Slice[] =>
  //   Array.from(
  //     getStored<StorageSlice>(SLICES_KEY).values(),
  //     (s: StorageSlice) => s.intoSlice()
  //   );

  static fromStorage = (): Slice[] =>
    Array.from(StorageSlice.fromStorage().values(), (s: StorageSlice) =>
      s.intoSlice()
    );

  toStorage = () => {
    const storageSlices = StorageSlice.fromStorage();

    // If the name has changed, update the stored slice names
    if (this.name !== this.initialName) {
      // If the new name already exists, throw an error
      if (storageSlices.has(this.name)) {
        throw new Error(`Slice with name ${this.name} already exists`);
      } else {
        // Update the slice names in templates and users
        StorageTemplate.updateSliceNames(this.initialName, this.name);
        StorageUser.updateSliceNames(this.initialName, this.name);
        // Delete the old slice
        storageSlices.delete(this.initialName);
      }
    }

    // Add the new slice
    storageSlices.set(
      this.name,
      new StorageSlice(this.name, this.color, this.desc)
    );
    // Update localStorage
    setStored(SLICES_KEY, storageSlices);
  };

  deleteStorage = () => {
    const storageSlices = StorageSlice.fromStorage();
    storageSlices.delete(this.name);

    // Delete the slice from templates and users
    StorageTemplate.deleteSlice(this.name);
    StorageUser.deleteSlice(this.name);

    setStored(SLICES_KEY, storageSlices);
  };

  preview = (
    sizeKind: SizeKind,
    viewRef?: RefObject<Element>,
    onClick?: (slice: GradedSlice) => void,
    fileName?: string
  ): ReactElement =>
    new GradedSlice(this, 10).preview(sizeKind, viewRef, onClick, fileName);

  previewDesc = (): ReactElement | undefined =>
    this.desc ? <Typography>{this.desc}</Typography> : undefined;

  deepClone = (): Slice =>
    new Slice(this.color, this.name, this.desc, this.initialName);

  clone = this.deepClone;
}

class StorageTemplate {
  public name: string;
  public sliceNames: string[];

  constructor(name: string, sliceNames: string[]) {
    this.name = name;
    this.sliceNames = sliceNames;
  }

  static default = (): StorageTemplate => new StorageTemplate("", []);

  static fromStorage = (): Map<string, StorageTemplate> =>
    getStored<StorageTemplate>(TEMPLATES_KEY, (o: any) =>
      Object.assign(this.default(), o)
    );

  static updateSliceNames = (oldName: string, newName: string) => {
    const storageTemplates = this.fromStorage();
    let changed = false;
    storageTemplates.forEach((t) => {
      const index = t.sliceNames.indexOf(oldName);
      if (index !== -1) {
        t.sliceNames[index] = newName;
        changed = true;
      }
    });
    if (changed) setStored(TEMPLATES_KEY, storageTemplates);
  };

  static deleteSlice = (sliceName: string) => {
    const storageTemplates = this.fromStorage();
    let changed = false;
    storageTemplates.forEach((t) => {
      const index = t.sliceNames.indexOf(sliceName);
      if (index !== -1) {
        t.sliceNames.splice(index, 1);
        changed = true;
      }
    });
    if (changed) setStored(TEMPLATES_KEY, storageTemplates);
  };

  intoTemplate = (storageSlices: Map<string, StorageSlice>): Template =>
    new Template(
      this.name,
      this.sliceNames.map((name: string) =>
        (storageSlices.get(name) as StorageSlice).intoSlice()
      )
    );
}

class Template {
  private initialName: string;

  public name: string;
  public key: string;
  public slices: Slice[];

  constructor(name: string, slices: Slice[], initialName?: string) {
    this.initialName = initialName ? initialName : name;
    this.name = name;
    this.key = name.toLowerCase().replace(/ /g, "_");
    this.slices = slices;
  }

  static default = (): Template => new Template("untitled", []);

  static fromStorage = (): Template[] => {
    const storageTemplates = StorageTemplate.fromStorage();
    const storageSlices = StorageSlice.fromStorage();
    return Array.from(storageTemplates.values(), (t: StorageTemplate) =>
      t.intoTemplate(storageSlices)
    );
  };

  toStorage = () => {
    const storageTemplates = StorageTemplate.fromStorage();

    if (this.name !== this.initialName) {
      if (storageTemplates.has(this.name)) {
        throw new Error(`Template with name ${this.name} already exists`);
      } else {
        storageTemplates.delete(this.initialName);
      }
    }

    storageTemplates.set(
      this.name,
      new StorageTemplate(
        this.name,
        this.slices.map((s) => s.name)
      )
    );
    setStored(TEMPLATES_KEY, storageTemplates);
  };

  deleteStorage = () => {
    const storageTemplates = StorageTemplate.fromStorage();
    storageTemplates.delete(this.name);
    setStored(TEMPLATES_KEY, storageTemplates);
  };

  preview = (
    sizeKind: SizeKind,
    viewRef?: RefObject<Element>,
    onClick?: (slice: GradedSlice) => void,
    fileName?: string
  ): ReactElement => (
    <Wheel
      slices={this.slices.map((s) => new GradedSlice(s, 10))}
      sizeKind={sizeKind}
      viewRef={viewRef}
      onClick={onClick}
      fileName={fileName}
    />
  );

  previewDesc = (): ReactElement | undefined =>
    this.slices.length === 0 ? undefined : (
      <Typography>
        {this.slices.map((s: Slice) => s.name).join(", ")}
      </Typography>
    );

  deepClone = (): Template =>
    new Template(
      this.name,
      this.slices.map((s) => s.deepClone()),
      this.initialName
    );

  clone = (): Template =>
    new Template(this.name, this.slices, this.initialName);

  // Appends the slice if it's new, otherwise removes it
  setSlice = (slice: Slice) => {
    const sameSliceIdx = this.slices.findIndex((s) => s.name === slice.name);
    if (sameSliceIdx === -1) this.slices.push(slice); // add (not found)
    else this.slices.splice(sameSliceIdx, 1); // del (found)
  };
}

class StorageGradedSlice {
  public sliceName: string;
  public grade: SliceGrade;
  public gradeDesc?: string;

  constructor(sliceName: string, grade: SliceGrade, gradeDesc?: string) {
    this.sliceName = sliceName;
    this.grade = grade;
    this.gradeDesc = gradeDesc;
  }
}

class GradedSlice {
  private slice: Slice;
  public grade: SliceGrade;
  public gradeDesc?: string;

  public get color(): string {
    return this.slice.color;
  }
  public get name(): string {
    return this.slice.name;
  }
  public get desc(): string | undefined {
    return this.slice.desc;
  }
  public get colorObj(): Color {
    return this.slice.colorObj;
  }
  public get key(): string {
    return this.slice.key;
  }

  constructor(slice: Slice, grade: SliceGrade, gradeDesc?: string) {
    this.slice = slice;
    this.grade = grade;
    this.gradeDesc = gradeDesc;
  }

  preview = (
    sizeKind: SizeKind,
    viewRef?: RefObject<Element>,
    onClick?: (slice: GradedSlice) => void,
    fileName?: string
  ): ReactElement => (
    <Wheel
      slices={[this]}
      sizeKind={sizeKind}
      viewRef={viewRef}
      onClick={onClick}
      fileName={fileName}
    />
  );

  // previewDesc = (): ReactElement | undefined =>
  //   this.gradeDesc ? <Typography>{this.gradeDesc}</Typography> : undefined;

  deepClone = (): GradedSlice =>
    new GradedSlice(this.slice.deepClone(), this.grade, this.gradeDesc);

  clone = (): GradedSlice =>
    new GradedSlice(this.slice, this.grade, this.gradeDesc);
}

class StorageUser {
  public name: string;
  public storageSlices: StorageGradedSlice[];

  constructor(name: string, storageSlices: StorageGradedSlice[]) {
    this.name = name;
    this.storageSlices = storageSlices;
  }

  static fromStorage = (): Map<string, StorageUser> =>
    getStored<StorageUser>(USERS_KEY, (o: any) =>
      Object.assign(this.default(), o)
    );

  static updateSliceNames = (oldName: string, newName: string) => {
    const storageUsers = this.fromStorage();
    let changed = false;
    storageUsers.forEach((u) => {
      u.storageSlices.forEach((s) => {
        if (s.sliceName === oldName) {
          s.sliceName = newName;
          changed = true;
        }
      });
    });
    if (changed) setStored(USERS_KEY, storageUsers);
  };

  static deleteSlice = (sliceName: string) => {
    const storageUsers = this.fromStorage();
    let changed = false;
    storageUsers.forEach((u) => {
      const idx = u.storageSlices.findIndex((s) => s.sliceName === sliceName);
      if (idx !== -1) {
        u.storageSlices.splice(idx, 1);
        changed = true;
      }
    });
    if (changed) setStored(USERS_KEY, storageUsers);
  };

  static default = (): StorageUser => new StorageUser("", []);

  intoUser = (storageSlices: Map<string, StorageSlice>): User =>
    new User(
      this.name,
      this.storageSlices.map(
        (s) =>
          new GradedSlice(
            storageSlices.get(s.sliceName)!.intoSlice(),
            s.grade,
            s.gradeDesc
          )
      )
    );
}

class User {
  private initialName: string;

  public name: string;
  public key: string;
  public slices: GradedSlice[];

  constructor(name: string, slices: GradedSlice[], initialName?: string) {
    this.initialName = initialName ? initialName : name;
    this.name = name;
    this.key = name.toLowerCase().replace(/ /g, "_");
    this.slices = slices;
  }

  static default = (): User => new User("untitled", []);

  static fromStorage = (): User[] => {
    const storageUsers = StorageUser.fromStorage();
    const storageSlices = StorageSlice.fromStorage();
    return Array.from(storageUsers.values(), (u: StorageUser) =>
      u.intoUser(storageSlices)
    );
  };

  toStorage = () => {
    const storageUsers = StorageUser.fromStorage();

    if (this.name !== this.initialName) {
      if (storageUsers.has(this.name)) {
        throw new Error(`User with name ${this.name} already exists`);
      } else {
        storageUsers.delete(this.initialName);
      }
    }

    storageUsers.set(
      this.name,
      new StorageUser(
        this.name,
        this.slices.map(
          (s) => new StorageGradedSlice(s.name, s.grade, s.gradeDesc)
        )
      )
    );
    setStored(USERS_KEY, storageUsers);
  };

  deleteStorage = () => {
    const storageUsers = StorageUser.fromStorage();
    storageUsers.delete(this.name);
    setStored(USERS_KEY, storageUsers);
  };

  preview = (
    sizeKind: SizeKind,
    viewRef?: RefObject<Element>,
    onClick?: (slice: GradedSlice) => void,
    fileName?: string
  ): ReactElement => (
    <Wheel
      slices={this.slices}
      sizeKind={sizeKind}
      viewRef={viewRef}
      onClick={onClick}
      fileName={fileName}
    />
  );

  previewDesc = (): ReactElement | undefined =>
    this.slices.length === 0 ? undefined : (
      <Typography>
        {this.slices
          .map((s: GradedSlice) => `${s.name}: ${s.grade}`)
          .join(", ")}
      </Typography>
    );

  deepClone = (): User =>
    new User(
      this.name,
      this.slices.map((slice) => slice.deepClone()),
      this.initialName
    );

  clone = (): User => new User(this.name, this.slices, this.initialName);

  setTemplate = (template: Template, defaultGrade: SliceGrade) =>
    (this.slices = template.slices.map((templateSlice) => {
      const sameSlice = this.slices.find((s) => s.name === templateSlice.name);
      if (sameSlice) return sameSlice; // keep grade
      else return new GradedSlice(templateSlice, defaultGrade); // new grade
    }));
}

export {
  Slice,
  GradedSlice,
  User,
  Template,
  StorageSlice,
  StorageTemplate,
  StorageUser,
};
export type { SliceGrade };
