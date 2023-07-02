import { StorageSlice, StorageTemplate, StorageUser } from "./WheelData";

const FILE_NAME = "autism-wheel-backup.json";
const TEMPLATES_KEY = "awr-templates";
const SLICES_KEY = "awr-slices";
const USERS_KEY = "awr-users";

const getStored = <T>(key: string, assign: (o: any) => T): Map<string, T> =>
  new Map(
    Object.entries(JSON.parse(localStorage.getItem(key) || "{}")).map(
      ([k, v]) => [k, assign(v)]
    )
  );

const setStored = <T>(key: string, value: Map<string, T>) =>
  localStorage.setItem(key, JSON.stringify(Object.fromEntries(value)));

// Resets all of the user's localStore data
const resetStored = () => {
  localStorage.setItem(SLICES_KEY, "{}");
  localStorage.setItem(TEMPLATES_KEY, "{}");
  localStorage.setItem(USERS_KEY, "{}");
};

// Downloads, for the user, a JSON file containing localStore data from the key
const downloadStored = () => {
  const get = (key: string) => `"${key}":${localStorage.getItem(key) || "{}"}`;
  const jsonStr =
    "{" +
    get(SLICES_KEY) +
    "," +
    get(TEMPLATES_KEY) +
    "," +
    get(USERS_KEY) +
    "}";
  const blob = new Blob([jsonStr], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = FILE_NAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// // Open the user's file explorer to select a JSON file to upload
// const uploadStored = () => {
//   const validateThenStore = (
//     key: string,
//     obj: any,
//     isValid: (v: any) => boolean
//   ): void => {
//     const vObj = obj[key];

//     // Validate
//     if (vObj === null || typeof vObj !== "object")
//       throw new Error(`Invalid ${key} data`);
//     for (const v of Object.values(vObj)) {
//       if (!isValid(v)) throw new Error(`Invalid ${key} data`);
//     }

//     // Store
//     localStorage.setItem(key, JSON.stringify(vObj));
//   };

//   const storeFile = (file: File) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       const jsonStr = reader.result as string;
//       const jsonObj = JSON.parse(jsonStr);
//       validateThenStore(
//         SLICES_KEY,
//         jsonObj,
//         (v: any) => v instanceof StorageSlice
//       );
//       validateThenStore(
//         TEMPLATES_KEY,
//         jsonObj,
//         (v: any) => v instanceof StorageTemplate
//       );
//       validateThenStore(
//         USERS_KEY,
//         jsonObj,
//         (v: any) => v instanceof StorageUser
//       );
//     };
//     reader.readAsText(file);
//   };

//   const selectFile = (onSelect: (file: File) => void) => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".json";
//     input.onchange = () => {
//       if (input.files) onSelect(input.files[0]);
//     };
//     input.click();
//   };

//   selectFile(storeFile);
// };

// Open the user's file explorer to select a JSON file to upload
const uploadStored = () => {
  const validateThenStore = (key: string, obj: any): void => {
    const vObj = obj[key];
    localStorage.setItem(key, JSON.stringify(vObj));
  };

  const storeFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const jsonStr = reader.result as string;
      const jsonObj = JSON.parse(jsonStr);
      validateThenStore(SLICES_KEY, jsonObj);
      validateThenStore(TEMPLATES_KEY, jsonObj);
      validateThenStore(USERS_KEY, jsonObj);
    };
    reader.readAsText(file);
  };

  const selectFile = (onSelect: (file: File) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      if (input.files) onSelect(input.files[0]);
    };
    input.click();
  };

  selectFile(storeFile);
};

export {
  getStored,
  setStored,
  downloadStored,
  uploadStored,
  resetStored,
  TEMPLATES_KEY,
  SLICES_KEY,
  USERS_KEY,
};
