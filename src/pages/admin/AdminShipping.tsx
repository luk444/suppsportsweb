import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Store, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Settings,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Building2,
  User,
  Hash,
  Info,
  ExternalLink
} from 'lucide-react';
import { useSiteConfig } from '../../contexts/SiteConfigContext';
import { useToast } from '../../contexts/ToastContext';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  enabled: boolean;
  estimatedDays?: string;
}

const AdminShipping: React.FC = () => {
  const { siteConfig, updateShippingOptions, updatePaymentMethods, refreshConfig } = useSiteConfig();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingOption, setEditingOption] = useState<ShippingOption | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMercadoPagoInfo, setShowMercadoPagoInfo] = useState(false);

  const [newOption, setNewOption] = useState<Partial<ShippingOption>>({
    name: '',
    description: '',
    price: 0,
    enabled: true,
    estimatedDays: ''
  });

  const [storeInfo, setStoreInfo] = useState({
    storeAddress: siteConfig?.storeAddress || '',
    storePhone: siteConfig?.storePhone || '',
    storeEmail: siteConfig?.storeEmail || '',
    storeHours: siteConfig?.storeHours || ''
  });

  const [bankInfo, setBankInfo] = useState({
    bankName: siteConfig?.bankDetails?.bankName || '',
    accountHolder: siteConfig?.bankDetails?.accountHolder || '',
    cbu: siteConfig?.bankDetails?.cbu || '',
    alias: siteConfig?.bankDetails?.alias || '',
    cuit: siteConfig?.bankDetails?.cuit || ''
  });

  const [paymentMethods, setPaymentMethods] = useState(
    siteConfig?.paymentMethods || [
      {
        id: 'bank-transfer',
        name: 'Transferencia Bancaria',
        description: 'Pago por transferencia bancaria',
        enabled: true,
        icon: 'building2'
      },
      {
        id: 'mercadopago',
        name: 'MercadoPago',
        description: 'Pago con tarjeta de crédito/débito',
        enabled: false,
        icon: 'credit-card'
      }
    ]
  );

  // Actualizar estados cuando se cargue la configuración
  useEffect(() => {
    if (siteConfig) {
      setStoreInfo({
        storeAddress: siteConfig.storeAddress || '',
        storePhone: siteConfig.storePhone || '',
        storeEmail: siteConfig.storeEmail || '',
        storeHours: siteConfig.storeHours || ''
      });

      setBankInfo({
        bankName: siteConfig.bankDetails?.bankName || '',
        accountHolder: siteConfig.bankDetails?.accountHolder || '',
        cbu: siteConfig.bankDetails?.cbu || '',
        alias: siteConfig.bankDetails?.alias || '',
        cuit: siteConfig.bankDetails?.cuit || ''
      });

      setPaymentMethods(siteConfig.paymentMethods || [
        {
          id: 'bank-transfer',
          name: 'Transferencia Bancaria',
          description: 'Pago por transferencia bancaria',
          enabled: true,
          icon: 'building2'
        },
        {
          id: 'mercadopago',
          name: 'MercadoPago',
          description: 'Pago con tarjeta de crédito/débito',
          enabled: false,
          icon: 'credit-card'
        }
      ]);
    }
  }, [siteConfig]);

  const handleSaveShippingOptions = async () => {
    if (!siteConfig) return;

    try {
      setIsLoading(true);
      await updateShippingOptions(siteConfig.shippingOptions);
      addToast('Opciones de envío actualizadas correctamente', 'success');
    } catch (error) {
      console.error('Error updating shipping options:', error);
      addToast('Error al actualizar las opciones de envío', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOption = (optionId: string) => {
    if (!siteConfig) return;

    const updatedOptions = siteConfig.shippingOptions.map(option =>
      option.id === optionId ? { ...option, enabled: !option.enabled } : option
    );

    updateShippingOptions(updatedOptions);
    addToast('Opción de envío actualizada', 'success');
  };

  const handleUpdatePrice = (optionId: string, newPrice: number) => {
    if (!siteConfig) return;

    const updatedOptions = siteConfig.shippingOptions.map(option =>
      option.id === optionId ? { ...option, price: newPrice } : option
    );

    updateShippingOptions(updatedOptions);
  };

  const handleAddOption = async () => {
    if (!siteConfig || !newOption.name || !newOption.description) {
      addToast('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const option: ShippingOption = {
      id: `option_${Date.now()}`,
      name: newOption.name,
      description: newOption.description,
      price: newOption.price || 0,
      enabled: newOption.enabled || true,
      estimatedDays: newOption.estimatedDays
    };

    const updatedOptions = [...siteConfig.shippingOptions, option];
    await updateShippingOptions(updatedOptions);
    
    setNewOption({
      name: '',
      description: '',
      price: 0,
      enabled: true,
      estimatedDays: ''
    });
    setShowAddForm(false);
    addToast('Opción de envío agregada correctamente', 'success');
  };

  const handleDeleteOption = async (optionId: string) => {
    if (!siteConfig) return;

    const updatedOptions = siteConfig.shippingOptions.filter(option => option.id !== optionId);
    await updateShippingOptions(updatedOptions);
    addToast('Opción de envío eliminada correctamente', 'success');
  };

  const handleSaveStoreInfo = async () => {
    if (!siteConfig) return;

    try {
      setIsLoading(true);
      await updateShippingOptions(siteConfig.shippingOptions, {
        ...storeInfo,
        bankDetails: bankInfo,
        paymentMethods: paymentMethods
      });
      addToast('Información del local, datos bancarios y métodos de pago actualizados correctamente', 'success');
    } catch (error) {
      console.error('Error updating store info:', error);
      addToast('Error al actualizar la información', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePaymentMethod = async (methodId: string) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === methodId ? { ...method, enabled: !method.enabled } : method
    );
    setPaymentMethods(updatedMethods);
    
    try {
      await updatePaymentMethods(updatedMethods);
      addToast('Método de pago actualizado', 'success');
    } catch (error) {
      console.error('Error updating payment method:', error);
      addToast('Error al actualizar el método de pago', 'error');
    }
  };

  const handleAddPaymentMethod = async () => {
    const newMethod = {
      id: `payment_${Date.now()}`,
      name: 'Nuevo Método',
      description: 'Descripción del método de pago',
      enabled: true,
      icon: 'credit-card'
    };
    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    
    try {
      await updatePaymentMethods(updatedMethods);
      addToast('Método de pago agregado', 'success');
    } catch (error) {
      console.error('Error adding payment method:', error);
      addToast('Error al agregar el método de pago', 'error');
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
    setPaymentMethods(updatedMethods);
    
    try {
      await updatePaymentMethods(updatedMethods);
      addToast('Método de pago eliminado', 'success');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      addToast('Error al eliminar el método de pago', 'error');
    }
  };

  const handleInitializeDefaultConfig = async () => {
    try {
      setIsLoading(true);
      const defaultPaymentMethods = [
        {
          id: 'bank-transfer',
          name: 'Transferencia Bancaria',
          description: 'Paga mediante transferencia bancaria',
          enabled: true,
          icon: 'building2'
        },
        {
          id: 'mercadopago',
          name: 'MercadoPago',
          description: 'Paga con tarjeta, efectivo o transferencia',
          enabled: false,
          icon: 'credit-card'
        }
      ];
      
      await updatePaymentMethods(defaultPaymentMethods);
      setPaymentMethods(defaultPaymentMethods);
      addToast('Configuración por defecto inicializada', 'success');
    } catch (error) {
      console.error('Error initializing default config:', error);
      addToast('Error al inicializar la configuración', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!siteConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  // Si no hay métodos de pago, mostrar botón para inicializar
  if (!siteConfig.paymentMethods || siteConfig.paymentMethods.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-900 mb-4">Configuración Inicial Requerida</h2>
          <p className="text-yellow-800 mb-4">
            No se encontraron métodos de pago configurados. Es necesario inicializar la configuración por defecto.
          </p>
          <button
            onClick={handleInitializeDefaultConfig}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Inicializando...' : 'Inicializar Configuración por Defecto'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Configuración de Envíos</h1>
        <button
          onClick={handleSaveShippingOptions}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          <Save size={16} className="mr-2" />
          {isLoading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Información de MercadoPago */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-900 flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Configuración de MercadoPago
          </h2>
          <button
            onClick={() => setShowMercadoPagoInfo(!showMercadoPagoInfo)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Info size={20} />
          </button>
        </div>
        
        {showMercadoPagoInfo && (
          <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Pasos para configurar MercadoPago:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Crear cuenta en <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">MercadoPago Developers <ExternalLink size={12} className="ml-1" /></a></li>
              <li>Obtener las credenciales de Test y Producción</li>
              <li>Configurar las variables de entorno en el archivo <code className="bg-blue-100 px-1 rounded">.env</code></li>
              <li>Configurar las URLs de retorno en el panel de MercadoPago</li>
              <li>Habilitar MercadoPago como método de pago en esta sección</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Consulta el archivo <code className="bg-yellow-100 px-1 rounded">MERCADOPAGO_SETUP.md</code> para instrucciones detalladas.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Estado de MercadoPago</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${siteConfig?.paymentMethods?.find(m => m.id === 'mercadopago')?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {siteConfig?.paymentMethods?.find(m => m.id === 'mercadopago')?.enabled ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Variables de Entorno</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Public Key:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ? '✅ Configurado' : '❌ No configurado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Access Token:</span>
                <span className="font-mono text-xs">
                  {import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información del Local */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Store className="mr-2 h-5 w-5" />
            Información del Local
          </h2>
          <button
            onClick={handleSaveStoreInfo}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline mr-1 h-4 w-4" />
              Dirección
            </label>
            <input
              type="text"
              value={storeInfo.storeAddress}
              onChange={(e) => setStoreInfo({ ...storeInfo, storeAddress: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Dirección del local"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline mr-1 h-4 w-4" />
              Teléfono
            </label>
            <input
              type="text"
              value={storeInfo.storePhone}
              onChange={(e) => setStoreInfo({ ...storeInfo, storePhone: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Teléfono del local"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline mr-1 h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={storeInfo.storeEmail}
              onChange={(e) => setStoreInfo({ ...storeInfo, storeEmail: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Email del local"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline mr-1 h-4 w-4" />
              Horarios
            </label>
            <input
              type="text"
              value={storeInfo.storeHours}
              onChange={(e) => setStoreInfo({ ...storeInfo, storeHours: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Ej: Lunes a Viernes 9:00 - 18:00"
            />
          </div>
        </div>
      </div>

      {/* Datos Bancarios */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Building2 className="mr-2 h-5 w-5" />
          Datos Bancarios para Transferencia
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="inline mr-1 h-4 w-4" />
              Banco
            </label>
            <input
              type="text"
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Nombre del banco"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline mr-1 h-4 w-4" />
              Titular de la Cuenta
            </label>
            <input
              type="text"
              value={bankInfo.accountHolder}
              onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Nombre del titular"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline mr-1 h-4 w-4" />
              CBU
            </label>
            <input
              type="text"
              value={bankInfo.cbu}
              onChange={(e) => setBankInfo({ ...bankInfo, cbu: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="CBU de la cuenta"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline mr-1 h-4 w-4" />
              Alias
            </label>
            <input
              type="text"
              value={bankInfo.alias}
              onChange={(e) => setBankInfo({ ...bankInfo, alias: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="Alias de la cuenta"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline mr-1 h-4 w-4" />
              CUIT
            </label>
            <input
              type="text"
              value={bankInfo.cuit}
              onChange={(e) => setBankInfo({ ...bankInfo, cuit: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              placeholder="CUIT del titular"
            />
          </div>
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Métodos de Pago
          </h2>
          <button
            onClick={handleAddPaymentMethod}
            className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Agregar Método
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${method.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <CreditCard className={`w-5 h-5 ${method.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${method.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {method.name}
                    </h3>
                    <p className={`text-sm ${method.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                      {method.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.enabled}
                        onChange={() => handleTogglePaymentMethod(method.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  
                  {method.id !== 'bank-transfer' && method.id !== 'mercadopago' && (
                    <button
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar método"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Opciones de Envío */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Truck className="mr-2 h-5 w-5" />
            Opciones de Envío
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <Plus size={16} className="mr-1" />
            Agregar Opción
          </button>
        </div>

        {/* Formulario para agregar nueva opción */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-4">Nueva Opción de Envío</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Ej: Envío Express"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={newOption.description}
                  onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Ej: Envío en 24 horas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <input
                  type="number"
                  value={newOption.price}
                  onChange={(e) => setNewOption({ ...newOption, price: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Estimado</label>
                <input
                  type="text"
                  value={newOption.estimatedDays}
                  onChange={(e) => setNewOption({ ...newOption, estimatedDays: e.target.value })}
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Ej: 1-3 días hábiles"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de opciones de envío */}
        <div className="space-y-4">
          {siteConfig.shippingOptions.map((option) => (
            <div key={option.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${option.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {option.id === 'pickup' ? (
                      <Store className={`w-5 h-5 ${option.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                    ) : (
                      <Truck className={`w-5 h-5 ${option.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-medium ${option.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {option.name}
                    </h3>
                    <p className={`text-sm ${option.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                      {option.description}
                    </p>
                    {option.estimatedDays && (
                      <p className="text-xs text-gray-500">
                        Tiempo estimado: {option.estimatedDays}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      value={option.price}
                      onChange={(e) => handleUpdatePrice(option.id, parseFloat(e.target.value) || 0)}
                      className="w-20 rounded-md border border-gray-300 p-1 text-center"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.enabled}
                        onChange={() => handleToggleOption(option.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                    </label>
                  </div>
                  
                  {option.id !== 'pickup' && option.id !== 'delivery' && (
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar opción"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminShipping; 