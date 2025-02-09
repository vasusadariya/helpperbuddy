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