import crypto from "node:crypto";
import { AppError } from "./errors.js";

type SignatureInput = {
  folder: string;
};

export function createCloudinarySignature({ folder }: SignatureInput) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError("Cloudinary não configurado no backend", 500);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  return {
    cloudName,
    apiKey,
    folder,
    timestamp,
    signature
  };
}
