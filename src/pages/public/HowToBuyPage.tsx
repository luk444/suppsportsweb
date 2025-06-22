import React from 'react';
import { ShoppingCart, CreditCard, Truck, CheckCircle, User, Search, Heart } from 'lucide-react';

const HowToBuyPage: React.FC = () => {
  const steps = [
    {
      icon: <Search size={24} />,
      title: '1. Busca Productos',
      description: 'Navega por nuestra tienda y encuentra los suplementos que necesitas. Usa los filtros para encontrar productos específicos por marca, categoría o precio.',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      icon: <Heart size={24} />,
      title: '2. Agrega a Favoritos',
      description: 'Guarda tus productos favoritos para comprarlos más tarde. Puedes acceder a ellos desde el menú de favoritos.',
      color: 'bg-red-50 text-red-600'
    },
    {
      icon: <ShoppingCart size={24} />,
      title: '3. Agrega al Carrito',
      description: 'Haz clic en "Agregar al carrito" en los productos que quieras comprar. Puedes ajustar las cantidades desde el carrito.',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      icon: <User size={24} />,
      title: '4. Inicia Sesión',
      description: 'Si no tienes cuenta, regístrate. Si ya tienes una, inicia sesión para continuar con la compra.',
      color: 'bg-green-50 text-green-600'
    },
    {
      icon: <CreditCard size={24} />,
      title: '5. Completa el Pago',
      description: 'Elige tu método de pago preferido y completa la información de facturación y envío.',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      icon: <Truck size={24} />,
      title: '6. Recibe tu Pedido',
      description: 'Una vez confirmado el pago, procesaremos tu pedido y lo enviaremos a tu dirección.',
      color: 'bg-indigo-50 text-indigo-600'
    }
  ];

  const paymentMethods = [
    {
      name: 'Transferencia Bancaria',
      description: 'Transferencia inmediata desde tu banco',
      icon: '🏦',
      processing: 'Inmediato'
    },
    {
      name: 'Mercado Pago',
      description: 'Pago con tarjeta, efectivo o billetera digital',
      icon: '💳',
      processing: 'Inmediato'
    },
    {
      name: 'Efectivo',
      description: 'Pago en efectivo al recibir el pedido',
      icon: '💵',
      processing: 'Al recibir'
    }
  ];

  const shippingOptions = [
    {
      name: 'Nuestro Envío',
      price: '$3.000',
      time: '24-48 horas',
      description: 'Envío con nuestro servicio de delivery propio',
      coverage: 'CABA y GBA'
    },
    {
      name: 'Correo Argentino',
      price: '$5.000',
      time: '3-7 días hábiles',
      description: 'Envío a través de Correo Argentino',
      coverage: 'Todo el país'
    },
    {
      name: 'Retiro en Local',
      price: 'GRATIS',
      time: 'Inmediato',
      description: 'Retirá tu pedido en nuestro local',
      coverage: 'Av. Corrientes 1234, CABA'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cómo Comprar</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Te guiamos paso a paso para que tu experiencia de compra sea fácil y rápida
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Pasos para Comprar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${step.color}`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Métodos de Pago</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-4xl mb-4">{method.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Procesamiento: {method.processing}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Options */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Opciones de Envío</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shippingOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{option.name}</h3>
                  <span className="text-2xl font-bold text-yellow-600">{option.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{option.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <Truck size={16} className="mr-2" />
                    <span>{option.time}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle size={16} className="mr-2" />
                    <span>{option.coverage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Necesito crear una cuenta para comprar?</h3>
              <p className="text-gray-600 text-sm">
                Sí, es necesario crear una cuenta para realizar compras. Esto nos permite gestionar tus pedidos y mantenerte informado sobre el estado de tus envíos.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Cuáles son los horarios de atención?</h3>
              <p className="text-gray-600 text-sm">
                Nuestro equipo de atención al cliente está disponible de lunes a viernes de 9:00 a 18:00, y sábados de 9:00 a 15:00.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Puedo cancelar mi pedido?</h3>
              <p className="text-gray-600 text-sm">
                Puedes cancelar tu pedido siempre que no haya sido despachado. Contacta a nuestro equipo de soporte para solicitar la cancelación.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué documentos necesito para retirar en local?</h3>
              <p className="text-gray-600 text-sm">
                Necesitas tu DNI y el número de pedido. Si retira otra persona, debe traer autorización firmada y fotocopia de tu DNI.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Ofrecen garantía en los productos?</h3>
              <p className="text-gray-600 text-sm">
                Sí, todos nuestros productos tienen garantía del fabricante. Si tienes algún problema, contacta a nuestro equipo de soporte.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            ¿Tienes alguna pregunta sobre el proceso de compra?
          </p>
          <a
            href="/support"
            className="inline-flex items-center px-6 py-3 bg-yellow-400 text-white font-medium rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowToBuyPage; 