import { createHash, randomInt } from "crypto";

export function generateOtpCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashOtpCode(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}
