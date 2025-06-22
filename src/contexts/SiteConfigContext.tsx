import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  estimatedDays?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon?: string;
}

interface BankDetails {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
}

interface SiteConfig {
  shippingOptions: ShippingOption[];
  paymentMethods: PaymentMethod[];
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeHours: string;
  bankDetails: BankDetails;
}

interface SiteConfigContextType {
  siteConfig: SiteConfig | null;
  loading: boolean;
  updateShippingOptions: (options: ShippingOption[], storeInfo?: Partial<SiteConfig>) => Promise<void>;
  updatePaymentMethods: (methods: PaymentMethod[]) => Promise<void>;
  refreshConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSiteConfig = async () => {
    try {
      setLoading(true);
      const configDoc = await getDoc(doc(db, 'siteConfig', 'main'));
      
      if (configDoc.exists()) {
        setSiteConfig(configDoc.data() as SiteConfig);
      } else {
        // Configuración por defecto
        const defaultConfig: SiteConfig = {
          shippingOptions: [
            {
              id: 'pickup',
              name: 'Retiro en Local',
              description: 'Retira tu pedido en nuestro local',
              price: 0,
              enabled: true,
              estimatedDays: 'Inmediato'
            },
            {
              id: 'delivery',
              name: 'Envío a Domicilio',
              description: 'Envío a tu dirección',
              price: 0,
              enabled: true,
              estimatedDays: '1-3 días hábiles'
            }
          ],
          paymentMethods: [
            {
              id: 'bank-transfer',
              name: 'Transferencia Bancaria',
              description: 'Paga mediante transferencia bancaria',
              enabled: true,
              icon: 'bank'
            },
            {
              id: 'mercadopago',
              name: 'MercadoPago',
              description: 'Paga con tarjeta, efectivo o transferencia',
              enabled: true,
              icon: 'mercadopago'
            }
          ],
          storeAddress: 'Nazarre 3584, C1417 CABA',
          storePhone: '+54 11 1234-5678',
          storeEmail: 'info@rpsmotors.com',
          storeHours: 'Lunes a Viernes 9:00 - 18:00, Sábados 9:00 - 13:00',
          bankDetails: {
            bankName: 'Banco de la Nación Argentina',
            accountHolder: 'RPS Motor Parts S.R.L.',
            cbu: '0110012345678901234567',
            alias: 'RPS.MOTOR.PARTS',
            cuit: '30-12345678-9'
          }
        };
        
        await setDoc(doc(db, 'siteConfig', 'main'), defaultConfig);
        setSiteConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading site config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShippingOptions = async (options: ShippingOption[], storeInfo?: Partial<SiteConfig>) => {
    if (!siteConfig) return;
    
    try {
      const updatedConfig = { 
        ...siteConfig, 
        shippingOptions: options,
        ...(storeInfo && {
          storeAddress: storeInfo.storeAddress || siteConfig.storeAddress,
          storePhone: storeInfo.storePhone || siteConfig.storePhone,
          storeEmail: storeInfo.storeEmail || siteConfig.storeEmail,
          storeHours: storeInfo.storeHours || siteConfig.storeHours,
          bankDetails: storeInfo.bankDetails || siteConfig.bankDetails,
          paymentMethods: storeInfo.paymentMethods || siteConfig.paymentMethods
        })
      };
      await setDoc(doc(db, 'siteConfig', 'main'), updatedConfig);
      setSiteConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating shipping options:', error);
      throw error;
    }
  };

  const updatePaymentMethods = async (methods: PaymentMethod[]) => {
    if (!siteConfig) return;
    
    try {
      const updatedConfig = { 
        ...siteConfig, 
        paymentMethods: methods
      };
      await setDoc(doc(db, 'siteConfig', 'main'), updatedConfig);
      setSiteConfig(updatedConfig);
    } catch (error) {
      console.error('Error updating payment methods:', error);
      throw error;
    }
  };

  const refreshConfig = async () => {
    await loadSiteConfig();
  };

  useEffect(() => {
    loadSiteConfig();
  }, []);

  const value = {
    siteConfig,
    loading,
    updateShippingOptions,
    updatePaymentMethods,
    refreshConfig
  };

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
} 