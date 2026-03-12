import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const dedicatedKey = process.env.MEMBER_ENCRYPTION_KEY;
  if (dedicatedKey) {
    return createHash("sha256").update(dedicatedKey).digest();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MEMBER_ENCRYPTION_KEY must be set in production. " +
      "Do not reuse NEXTAUTH_SECRET for message encryption."
    );
  }

  const fallback = process.env.NEXTAUTH_SECRET;
  if (!fallback) {
    throw new Error(
      "MEMBER_ENCRYPTION_KEY (or NEXTAUTH_SECRET for development) must be set."
    );
  }
  return createHash("sha256").update(fallback).digest();
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext (all base64)
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 3) return encryptedData; // Not encrypted (legacy data)

    const iv = Buffer.from(parts[0], "base64");
    const tag = Buffer.from(parts[1], "base64");
    const encrypted = Buffer.from(parts[2], "base64");

    if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) return encryptedData;

    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return encryptedData; // Return as-is if decryption fails (legacy unencrypted data)
  }
}
