import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase/client";

export async function uploadAnalysisImage(
  userId: string,
  analysisId: string,
  dataUrl: string
): Promise<{ url: string; path: string } | null> {
  const storage = getFirebaseStorage();
  if (!storage) return null;

  const path = `analyses/${userId}/${analysisId}.jpg`;
  const storageRef = ref(storage, path);

  await uploadString(storageRef, dataUrl, "data_url", {
    contentType: "image/jpeg",
  });

  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteAnalysisImage(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  if (!storage) return;
  await deleteObject(ref(storage, path)).catch(() => {});
}

export async function uploadProfilePhoto(
  userId: string,
  dataUrl: string
): Promise<string | null> {
  const storage = getFirebaseStorage();
  if (!storage) return null;

  const path = `profiles/${userId}/avatar.jpg`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, "data_url", {
    contentType: "image/jpeg",
  });
  return getDownloadURL(storageRef);
}
