import { api } from "@/components/admin/api-client";

export interface UploadedImage {
  url: string;
  width?: number;
  height?: number;
}

/** Envia um arquivo (ou blob recortado) a /upload/image e devolve url + dimensões. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api<UploadedImage>("/upload/image", {
    method: "POST",
    body: formData,
  });
  return { url: data.url, width: data.width, height: data.height };
}
