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
    console.error('Error sending approval email:', error);
    return { success: false, error };
  }
};


export const sendServiceRequestEmail = async (partnerData: {
  name: string;
  email: string;
  service: string;
  orderId: string;
}) => {
  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      {
        to_name: partnerData.name,
        to_email: partnerData.email,
        service: partnerData.service,
        accept_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/accept-order?orderId=${partnerData.orderId}`,
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('Error sending service request email:', error);
    return { success: false, error };
  }
};
