// ~/server/security/crypto.ts
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const key = Buffer.from(process.env.PHI_ENCRYPTION_KEY ?? "", "base64");
if (key.length !== 32) throw new Error("PHI_ENCRYPTION_KEY must be 32 bytes base64");

export function encryptToB64(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptFromB64(ciphertextB64: string): string {
  const buf = Buffer.from(ciphertextB64, "base64");
  const iv = buf.slice(0, 12);
  const tag = buf.slice(12, 28);
  const enc = buf.slice(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
