import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hash, "hex");

  if (derived.length !== hashBuffer.length) return false;
  return timingSafeEqual(derived, hashBuffer);
}
