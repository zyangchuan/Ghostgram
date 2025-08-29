export async function requestPhotoAuth(): Promise<"authorized"|"limited"|"denied"|"not_determined"> {
  return new Promise((resolve) => {
    NativeModules.PhotoLibraryModule.requestAuthorization((status: string) => resolve(status as any));
  });
}

export async function pickPhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    NativeModules.PhotoLibraryModule.pickPhoto((b64: string | null) => resolve(b64));
  });
}

export async function pickPhotos(): Promise<string[] | null> {
  return new Promise((resolve) => {
    NativeModules.PhotoLibraryModule.pickPhotos((json: string | null) => {
      resolve(json ? JSON.parse(json) : null);
    });
  });
}
