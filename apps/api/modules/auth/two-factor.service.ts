import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

export function generateTwoFactorSecret() {
  return generateSecret();
}

export function generateOtpAuthUrl(email: string, secret: string) {
  return generateURI({ label: email, issuer: "HAMMR", secret });
}

export async function generateQrCode(otpAuthUrl: string) {
  return QRCode.toDataURL(otpAuthUrl);
}

export async function verifyTwoFactorCode(token: string, secret: string) {
  const result = await verify({
    token,
    secret,
  });

  return result.valid;
}
