import nodemailer from "nodemailer";

function getMailerConfig() {
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const host = process.env.SMTP_HOST?.trim() || (user ? "smtp.gmail.com" : "");
  const port = Number(
    process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587)
  );
  const from = process.env.SMTP_FROM?.trim() || user;

  const pass =
    host === "smtp.gmail.com" && rawPass
      ? rawPass.replace(/\s+/g, "")
      : rawPass;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return { host, port, user, pass, from };
}

export async function sendResetOtpEmail(to: string, otp: string) {
  const config = getMailerConfig();
  if (!config) return { success: false as const, reason: "missing-smtp" as const };

  try {
    const isGmail = config.host === "smtp.gmail.com";
    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: "gmail",
            auth: {
              user: config.user,
              pass: config.pass
            }
          }
        : {
            host: config.host,
            port: config.port,
            secure: config.port === 465,
            auth: {
              user: config.user,
              pass: config.pass
            }
          }
    );

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
  } catch (error) {
    console.error("OTP_EMAIL_SEND_ERROR", error);
    return { success: false as const, reason: "send-failed" as const };
  }
}
