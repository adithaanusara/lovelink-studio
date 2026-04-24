import nodemailer from "nodemailer";

function getMailerConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

export async function sendResetOtpEmail(to: string, otp: string) {
  const config = getMailerConfig();
  if (!config) return { success: false as const, reason: "missing-smtp" as const };

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "LoveLink Studio - Your OTP code",
    text: `Your LoveLink Studio OTP is ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0f172a">
      <p>Your LoveLink Studio OTP is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:12px 0">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    </div>`
  });

  return { success: true as const };
}
