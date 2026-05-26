const nodemailer = require('nodemailer');

// Create transporter lazily so env vars are always resolved at call time
const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

const sendEmail = async ({ to, subject, html }) => {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'AjoFlow <noreply@ajoflow.com>',
    to,
    subject,
    html,
  });
};

/* ─── shared styles ─── */
const BASE = `
  font-family:'Helvetica Neue',Arial,sans-serif;
  margin:0;padding:0;background:#F0F4F8;
`;

const header = `
  <tr><td style="height:4px;background:linear-gradient(90deg,#0E2B1A 0%,#3DDC84 100%);"></td></tr>
  <tr><td style="background:#0E2B1A;padding:26px 40px 22px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#3DDC84;border-radius:10px;width:38px;height:38px;text-align:center;vertical-align:middle;
                 font-weight:800;color:#0E2B1A;font-size:1.1rem;line-height:38px;">A</td>
      <td style="padding-left:12px;color:#fff;font-size:1.2rem;font-weight:700;letter-spacing:-.02em;">AjoFlow</td>
    </tr></table>
  </td></tr>
`;

const footer = `
  <tr><td style="padding:20px 40px 32px;border-top:1px solid #F3F4F6;margin-top:8px;">
    <p style="margin:0;font-size:.73rem;color:#9CA3AF;text-align:center;line-height:1.7;">
      © ${new Date().getFullYear()} AjoFlow &nbsp;·&nbsp; Save Together, Thrive Together<br>
      <span style="font-size:.68rem;">If you didn't request this email, you can safely ignore it.</span>
    </p>
  </td></tr>
`;

/* ─── OTP email ─── */
const otpTemplate = (otp) => {
  const digitCells = otp.split('').map(d => `
    <td style="padding:0 5px;">
      <div style="width:52px;height:68px;background:#F9FAFB;border:2px solid #D1FAE5;border-radius:12px;
                  text-align:center;line-height:68px;font-size:2rem;font-weight:800;
                  color:#0E2B1A;font-family:'Courier New',monospace;letter-spacing:0;">${d}</div>
    </td>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your AjoFlow Login Code</title>
</head>
<body style="${BASE}">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:48px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.10);max-width:100%;">
        ${header}
        <tr><td style="padding:40px 40px 10px;text-align:center;">

          <!-- lock icon circle -->
          <div style="width:68px;height:68px;margin:0 auto 24px;background:#F0FDF4;
                      border-radius:50%;border:2px solid #BBF7D0;display:table;">
            <div style="display:table-cell;vertical-align:middle;text-align:center;
                        font-size:1.8rem;line-height:1;">🔐</div>
          </div>

          <h1 style="margin:0 0 10px;font-size:1.55rem;font-weight:800;color:#0E2B1A;letter-spacing:-.025em;">
            Your Login Code
          </h1>
          <p style="margin:0 0 32px;font-size:.93rem;color:#6B7280;line-height:1.65;">
            Enter this 6-digit code to complete your sign-in.<br>
            It expires in <strong style="color:#111827;">10 minutes</strong>.
          </p>

          <!-- digit boxes -->
          <table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 36px;">
            <tr>${digitCells}</tr>
          </table>

          <!-- divider hint -->
          <div style="background:#F9FAFB;border-radius:10px;padding:14px 24px;margin-bottom:8px;display:inline-block;
                      border:1px solid #E5E7EB;">
            <p style="margin:0;font-size:.82rem;color:#6B7280;">
              For your security, never share this code with anyone.
            </p>
          </div>

        </td></tr>
        ${footer}
      </table>

      <p style="margin:24px 0 0;font-size:.75rem;color:#9CA3AF;text-align:center;">
        Having trouble? Reply to this email or contact support.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
};

/* ─── Password reset email ─── */
const resetTemplate = (resetUrl) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reset Your AjoFlow Password</title>
</head>
<body style="${BASE}">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:48px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.10);max-width:100%;">
        ${header}
        <tr><td style="padding:40px 40px 10px;text-align:center;">

          <!-- key icon circle -->
          <div style="width:68px;height:68px;margin:0 auto 24px;background:#FFF7ED;
                      border-radius:50%;border:2px solid #FED7AA;display:table;">
            <div style="display:table-cell;vertical-align:middle;text-align:center;
                        font-size:1.8rem;line-height:1;">🔑</div>
          </div>

          <h1 style="margin:0 0 10px;font-size:1.55rem;font-weight:800;color:#0E2B1A;letter-spacing:-.025em;">
            Reset Your Password
          </h1>
          <p style="margin:0 0 32px;font-size:.93rem;color:#6B7280;line-height:1.65;text-align:left;">
            We received a request to reset your AjoFlow password. Click the button below to choose a new one.
            This link expires in <strong style="color:#111827;">15 minutes</strong>.
          </p>

          <a href="${resetUrl}"
             style="display:inline-block;background:#0E2B1A;color:#fff;text-decoration:none;
                    padding:15px 40px;border-radius:12px;font-weight:700;font-size:.95rem;
                    letter-spacing:.01em;margin-bottom:28px;">
            Reset Password →
          </a>

          <div style="background:#F9FAFB;border-radius:10px;padding:14px 20px;margin-bottom:8px;
                      border:1px solid #E5E7EB;text-align:left;">
            <p style="margin:0 0 6px;font-size:.78rem;color:#9CA3AF;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">
              Or copy this link:
            </p>
            <p style="margin:0;font-size:.78rem;color:#6B7280;word-break:break-all;line-height:1.5;">
              ${resetUrl}
            </p>
          </div>

        </td></tr>
        ${footer}
      </table>

      <p style="margin:24px 0 0;font-size:.75rem;color:#9CA3AF;text-align:center;">
        Having trouble? Reply to this email or contact support.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

module.exports = { sendEmail, otpTemplate, resetTemplate };
