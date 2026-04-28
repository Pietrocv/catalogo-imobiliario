import { api } from "./api";

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

export async function uploadImage(file: File, folder: "properties" | "property-requests" | "brokers", inviteToken?: string) {
  const signature = inviteToken
    ? await api<UploadSignature>(`/broker-invites/${inviteToken}/upload-signature`, {
        method: "POST",
        body: JSON.stringify({})
      })
    : await api<UploadSignature>("/uploads/signature", {
        method: "POST",
        body: JSON.stringify({ folder })
      });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar imagem");
  }

  const data = await response.json();
  return data.secure_url as string;
}
