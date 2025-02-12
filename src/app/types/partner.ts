export interface PartnerRegistrationData {
    name: string;
    email: string;
    password: string;
    services: string[] | string;
    pincodes: string[] | string;
  }
  
export interface PartnerResponse {
    id: string;
    userId: string;
    name: string;
    email: string;
    approved: boolean;
    role: string;
}

export interface WaitingOrderData {
  orderId: string;
  orderDetails: {
    totalAmount: number;
    walletAmount: number;
    remainingAmount: number;
    razorpayOrderId?: string;
    razorpayAmount: number;
    serviceDetails: {
      name: string;
      description: string;
    };
  };
}