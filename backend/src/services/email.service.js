import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

export const sendResetEmail = async (email, resetLink) => {
  try {
    const { token } = await oauth2Client.getAccessToken();

    const str = [
      `To: ${email}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      'Subject: Reset Your Password - Security Notification',
      '',
      `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Password Reset Request</h2>
        <p>A password reset was requested for your account. This link expires in <strong>5 minutes</strong>.</p>
        <a href="${resetLink}" style="background: #0f172a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not request this, please ignore this email.</p>
      </div>`
    ].join('\n');

    const encodedMail = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMail }
    });

    return true;
  } catch (error) {
    console.error('Gmail API Error:', error);
    throw new Error('Failed to send email');
  }
};