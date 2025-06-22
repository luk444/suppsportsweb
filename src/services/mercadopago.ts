// Configuración de MercadoPago
const MERCADOPAGO_PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || 'TEST-12345678-1234-1234-1234-123456789012';
const MERCADOPAGO_ACCESS_TOKEN = import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'TEST-12345678-1234-1234-1234-123456789012';

export interface MercadoPagoItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
  description?: string;
  picture_url?: string;
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer: {
    name: string;
    email: string;
    phone?: {
      number: string;
    };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  external_reference: string;
  notification_url?: string;
  expires: boolean;
  expiration_date_to?: string;
}

export interface MercadoPagoResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

class MercadoPagoService {
  private baseURL = 'https://api.mercadopago.com';

  async createPreference(preference: MercadoPagoPreference): Promise<MercadoPagoResponse> {
    try {
      const response = await fetch(`${this.baseURL}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preference),
      });

      if (!response.ok) {
        throw new Error(`Error creating preference: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error getting payment status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  getPublicKey(): string {
    return MERCADOPAGO_PUBLIC_KEY;
  }

  isTestMode(): boolean {
    return MERCADOPAGO_PUBLIC_KEY.startsWith('TEST-');
  }
}

export const mercadopagoService = new MercadoPagoService(); 