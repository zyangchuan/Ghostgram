declare let NativeModules: {
  PhotoLibraryModule: {
    // Ask for Photos permission – returns "authorized" | "limited" | "denied" | "not_determined"
    requestAuthorization(callback: (status: string) => void): void;

    // Present a system picker for a single photo. Returns base64 (without data URI prefix).
    pickPhoto(callback: (base64: string | null) => void): void;

    // Optional: pick multiple photos (set a limit in native code). Returns JSON stringified array of base64 strings.
    pickPhotos(callback: (jsonBase64Array: string | null) => void): void;
  };
};
