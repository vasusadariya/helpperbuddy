import prisma from '@/lib/prisma';
import emailjs from '@emailjs/nodejs';

interface ThresholdNotificationData {
  user: {
    name: string;
    email: string;
  };
  order: {
    id: string;
    serviceName: string;
    date: Date;
    time: string;
    address: string;
    pincode: string;
    amount: number;
    createdAt: Date;
    threshold: number;
  };
}

interface OrderAcceptanceEmailData {
  orderId: string;
}

interface NewOrderNotificationData {
  orderId: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  address: string;
  pincode: string;
  amount: number;
  customer: {
    name: string;
    phone?: string;
  };
}

interface NotificationResult {
  success: boolean;
  summary?: {
    total: number;
    successful: number;
    failed: number;
    timestamp: string;
  };
  error?: string;
  partnersCount: number;
}

// Required environment variables for main service
const mainServiceEnvVars = [
  'EMAILJS_PUBLIC_KEY',
  'EMAILJS_PRIVATE_KEY',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_ORDER_ACCEPTED_TEMPLATE_ID',
  'NEXT_PUBLIC_BASE_URL'
];

// Required environment variables for secondary service
const secondaryServiceEnvVars = [
  'EMAILJS_SECONDARY_PUBLIC_KEY',
  'EMAILJS_SECONDARY_PRIVATE_KEY',
  'EMAILJS_SECONDARY_SERVICE_ID',
  'EMAILJS_THRESHOLD_NOTIFICATION_TEMPLATE_ID',
  'EMAILJS_PARTNER_NOTIFICATION_TEMPLATE_ID'
];

// Track initialization status for both services
let isMainServiceInitialized = false;
let isSecondaryServiceInitialized = false;

const initializeMainService = () => {
  if (!isMainServiceInitialized) {
    for (const envVar of mainServiceEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable for main service: ${envVar}`);
      }
    }

    emailjs.init({
      publicKey: process.env.EMAILJS_PUBLIC_KEY!,
      privateKey: process.env.EMAILJS_PRIVATE_KEY!
    });

    isMainServiceInitialized = true;
  }
};

const initializeSecondaryService = () => {
  if (!isSecondaryServiceInitialized) {
    for (const envVar of secondaryServiceEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable for secondary service: ${envVar}`);
      }
    }

    emailjs.init({
      publicKey: process.env.EMAILJS_SECONDARY_PUBLIC_KEY!,
      privateKey: process.env.EMAILJS_SECONDARY_PRIVATE_KEY!
    });

    isSecondaryServiceInitialized = true;
  }
};

export const sendApprovalEmail = async (partnerData: {
  name: string;
  email: string;
  services: string[];
}) => {
  if (!partnerData || !partnerData.name || !partnerData.email ) {
    return { success: false, error: 'Invalid partner data provided' };
  }

  try {
    initializeMainService();
    
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

export async function sendOrderAcceptanceEmail(data: OrderAcceptanceEmailData) {
  try {
    initializeMainService();

    const order = await prisma.order.findUnique({
      where: {
        id: data.orderId,
      },
      include: {
        User: true,
        Partner: true,
        Service: true,
      },
    });

    if (!order || !order.Partner || !order.User) {
      throw new Error('Order, partner, or user details not found');
    }

    const formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const acceptanceTime = order.acceptedAt 
      ? new Date(order.acceptedAt).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'long',
          timeStyle: 'short'
        })
      : new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'long',
          timeStyle: 'short'
        });

    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_ORDER_ACCEPTED_TEMPLATE_ID!,
      {
        to_name: order.User.name,
        to_email: order.User.email,
        order_id: order.id,
        service_name: order.Service.name,
        service_date: formattedDate,
        service_time: order.time,
        service_address: order.address,
        service_pincode: order.pincode,
        amount: order.amount.toFixed(2),
        remarks: order.remarks || undefined,
        partner_name: order.Partner.name,
        partner_phone: order.Partner.phoneno || 'Not provided',
        partner_email: order.Partner.email,
        dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`,
        support_url: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
        acceptance_time: acceptanceTime
      }
    );

    return {
      success: true,
      messageId: response.status,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error sending order acceptance email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export const sendOrderThresholdNotification = async (data: ThresholdNotificationData) => {
  try {
    initializeSecondaryService();

    const formattedDate = new Date(data.order.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const orderCreatedAt = new Date(data.order.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'long',
      timeStyle: 'short'
    });

    const thresholdEndsAt = new Date(
      data.order.createdAt.getTime() + (data.order.threshold * 60 * 60 * 1000)
    ).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'long',
      timeStyle: 'short'
    });

    const response = await emailjs.send(
      process.env.EMAILJS_SECONDARY_SERVICE_ID!,
      process.env.EMAILJS_THRESHOLD_NOTIFICATION_TEMPLATE_ID!,
      {
        to_name: data.user.name,
        to_email: data.user.email,
        order_id: data.order.id,
        service_name: data.order.serviceName,
        service_date: formattedDate,
        service_time: data.order.time,
        service_address: data.order.address,
        service_pincode: data.order.pincode,
        amount: data.order.amount.toFixed(2),
        order_created_at: orderCreatedAt,
        threshold_hours: data.order.threshold,
        threshold_ends_at: thresholdEndsAt,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/dashboard`,
        dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL}/user/dashboard`,
        support_url: `${process.env.NEXT_PUBLIC_BASE_URL}/support`,
        notification_time: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'long',
          timeStyle: 'short'
        })
      }
    );

    return {
      success: true,
      messageId: response.status,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error sending threshold notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

export async function sendNewOrderToEligiblePartners(data: NewOrderNotificationData) {
  try {
    initializeSecondaryService();

    const eligiblePartners = await prisma.partner.findMany({
      where: {
        approved: true,
        isActive: true,
        AND: [
          {
            ServiceProvider: {
              some: {
                serviceId: data.serviceId,
                isActive: true
              }
            }
          },
          {
            PartnerPincode: {
              some: {
                pincode: data.pincode,
                isActive: true
              }
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        // phoneno: true
      }
    });

    if (eligiblePartners.length === 0) {
      return {
        success: false,
        error: 'No eligible partners found',
        partnersCount: 0
      };
    }

    const formattedDate = new Date(data.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const emailPromises = eligiblePartners.map(partner =>
      emailjs.send(
        process.env.EMAILJS_SECONDARY_SERVICE_ID!,
        process.env.EMAILJS_PARTNER_NOTIFICATION_TEMPLATE_ID!,
        {
          to_name: partner.name,
          to_email: partner.email,
          order_id: data.orderId,
          service_name: data.serviceName,
          service_date: formattedDate,
          service_time: data.time,
          service_pincode: data.pincode,
          service_amount: data.amount.toFixed(2),
          customer_name: data.customer.name,
          customer_phone: data.customer.phone || 'Will be shared upon acceptance',
          accept_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/orders/accept/${data.orderId}`,
          dashboard_url: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/dashboard`,
          timestamp: new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'long',
            timeStyle: 'short'
          })
        }
      ).catch(error => {
        console.error(`Failed to send email to partner ${partner.email}:`, error);
        return null;
      })
    );

    const results = await Promise.all(emailPromises);
    const successful = results.filter(result => result !== null).length;
    const failed = results.filter(result => result === null).length;

    const summary = {
      total: eligiblePartners.length,
      successful,
      failed,
      timestamp: new Date().toISOString()
    };

    console.log(`Order ${data.orderId} notification results:`, summary);

    return {
      success: successful > 0,
      summary,
      partnersCount: eligiblePartners.length
    };

  } catch (error) {
    console.error('Error in sendNewOrderToEligiblePartners:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      partnersCount: 0
    };
  }
}