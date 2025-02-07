// services/emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

export const sendApprovalEmail = async (partnerData: {
  name: string;
  email: string;
  services: string[];
}) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: partnerData.email,
      subject: 'Helper Buddy Partner Approval',
      html: `
        <h2>Welcome to Helper Buddy!</h2>
        <p>Dear ${partnerData.name},</p>
        <p>Your partner account has been approved. You can now provide the following services:</p>
        <p>${partnerData.services.join(', ')}</p>
        <p>Login to your account at: ${process.env.NEXT_PUBLIC_BASE_URL}/signin</p>
      `
    };

    const response = await transporter.sendMail(mailOptions);
    return { success: true, response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};