import emailjs from '@emailjs/nodejs';

// Verify required environment variables
const requiredEnvVars = [
  'EMAILJS_PUBLIC_KEY',
  'EMAILJS_PRIVATE_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'NEXT_PUBLIC_BASE_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

interface ServiceRequestEmailData {
  name: string;
  email: string;
  service: string;
  orderId: string;
}

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY!,
  privateKey: process.env.EMAILJS_PRIVATE_KEY!
});

export const sendApprovalEmail = async (partnerData: {
  name: string;
  email: string;
  services: string[];
}) => {
  if (!partnerData || !partnerData.name || !partnerData.email ) {
    return { success: false, error: 'Invalid partner data provided' };
  }

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      {
        to_name: partnerData.name,
        to_email: partnerData.email,
        login_url: `${process.env.NEXT_PUBLIC_BASE_URL}/signin`,
      }
    );
    return { success: true, response };
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error };
  }
};

export const sendServiceRequestEmail = async (data: ServiceRequestEmailData) => {
  try {
    // Validate input data
    if (!data || !data.name || !data.email || !data.service || !data.orderId) {
      return { 
        success: false, 
        error: 'Missing required email data' 
      };
    }

    // Create the email template parameters
    const templateParams = {
      to_name: data.name,
      to_email: data.email,
      service: data.service,
      accept_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/accept-order?orderId=${data.orderId}`
    };

    // Send the email
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      templateParams
    );

    return { success: true, response };
  } catch (error) {
    console.error('Error sending service request email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};