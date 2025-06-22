import React from 'react';
import { MessageCircle, Copy, X, Building2, User, CreditCard, Hash, DollarSign, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useSiteConfig } from '../../contexts/SiteConfigContext';

interface BankDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
}

const BankDetailsModal: React.FC<BankDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  orderId, 
  totalAmount,
  customerDetails 
}) => {
  const { addToast } = useToast();
  const { siteConfig } = useSiteConfig();

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast(`${label} copiado al portapapeles`, 'success');
    }).catch(() => {
      addToast('Error al copiar', 'error');
    });
  };

  const handleWhatsApp = () => {
    const message = `¡Hola! Soy ${customerDetails.name}. He realizado la orden #${orderId}.\n\n` +
      `Detalles del pedido:\n` +
      `- Número de orden: ${orderId}\n` +
      `- Total: $${totalAmount.toFixed(2)}\n` +
      `- Email: ${customerDetails.email}\n` +
      `- Teléfono: ${customerDetails.phone}\n\n` +
      `Quisiera enviar el comprobante de transferencia.`;
    
    const whatsappUrl = `https://wa.me/+541139193041?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  // Datos bancarios desde la configuración del sitio o por defecto
  const bankDetails = [
    {
      icon: Building2,
      label: 'Banco',
      value: siteConfig?.bankDetails?.bankName || 'Banco de la Nación Argentina',
      copyable: false
    },
    {
      icon: User,
      label: 'Titular',
      value: siteConfig?.bankDetails?.accountHolder || 'RPS Motor Parts S.R.L.',
      copyable: false
    },
    {
      icon: CreditCard,
      label: 'CBU',
      value: siteConfig?.bankDetails?.cbu || '0110012345678901234567',
      copyable: true
    },
    {
      icon: Hash,
      label: 'Alias',
      value: siteConfig?.bankDetails?.alias || 'RPS.MOTOR.PARTS',
      copyable: true
    },
    {
      icon: Hash,
      label: 'CUIT',
      value: siteConfig?.bankDetails?.cuit || '30-12345678-9',
      copyable: true
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalles de Transferencia
              </h2>
              <p className="text-sm text-gray-600">
                Completa tu pago con los siguientes datos
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Bank Details Grid */}
          <div className="grid grid-cols-1 gap-3">
            {bankDetails.map((detail, index) => {
              const IconComponent = detail.icon;
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <IconComponent size={16} className="text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {detail.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {detail.value}
                        </p>
                      </div>
                    </div>
                    {detail.copyable && (
                      <button
                        onClick={() => copyToClipboard(detail.value, detail.label)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        title={`Copiar ${detail.label}`}
                      >
                        <Copy size={14} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amount to Transfer */}
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <DollarSign size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700">
                    Monto a transferir
                  </p>
                  <p className="text-xl font-bold text-yellow-900">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-medium">Importante:</span> Después de realizar la transferencia, 
              envíanos el comprobante por WhatsApp para procesar tu pedido.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={handleWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <MessageCircle size={18} />
            <span>Enviar Comprobante por WhatsApp</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsModal;