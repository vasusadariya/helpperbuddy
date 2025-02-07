// services/emailService.ts
import emailjs from '@emailjs/nodejs';

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!
});

export const sendApprovalEmail = async (partnerData: {
  name: string;
  email: string;
  services: string[];
}) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      {
        to_name: partnerData.name,
        to_email: partnerData.email,
        services: partnerData.services.join(', '),
        login_url: `${process.env.NEXT_PUBLIC_BASE_URL}/signin`,
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendOrderNotification = async (partnerData: {
    name: string;
    email: string;
    orderId: string;
  }) => {
    try {
      const response = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID!,
        process.env.EMAILJS_ORDER_TEMPLATE_ID!, // Create an EmailJS template for order notifications
        {
          to_name: partnerData.name,
          to_email: partnerData.email,
          order_id: partnerData.orderId,
          accept_order_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/orders/${partnerData.orderId}`,
        }
      );
      return { success: true, response };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }
  };