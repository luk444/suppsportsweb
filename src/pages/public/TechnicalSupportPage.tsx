import React from 'react';
import { FileText, Video, MessageCircle, Phone, Mail, Clock, Heart, Shield, Award } from 'lucide-react';

const TechnicalSupportPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Centro de Ayuda y Soporte</h1>
        <p className="text-gray-600 mb-8">
          Obtén asesoramiento experto sobre nutrición deportiva, uso de suplementos y resolución de dudas.
        </p>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <FileText size={24} />
              </div>
              <h2 className="text-xl font-semibold ml-4">Guías Nutricionales</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Accede a guías completas sobre suplementación, planes de nutrición y rutinas de entrenamiento.
            </p>
            <a
              href="#"
              className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            >
              Explorar Guías →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Video size={24} />
              </div>
              <h2 className="text-xl font-semibold ml-4">Video Tutoriales</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Aprende cómo usar correctamente los suplementos y optimizar tu nutrición deportiva.
            </p>
            <a
              href="#"
              className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            >
              Ver Tutoriales →
            </a>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <Heart size={24} />
              </div>
              <h2 className="text-xl font-semibold ml-4">Asesoría Personalizada</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Recibe recomendaciones personalizadas de nuestros expertos en nutrición deportiva.
            </p>
            <a
              href="#"
              className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
            >
              Solicitar Asesoría →
            </a>
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Contacta a Nuestro Equipo de Expertos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4 text-yellow-600">Horarios de Atención</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Lunes a Viernes: 9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Sábado: 9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>Domingo: 10:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-yellow-600">Métodos de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone size={20} className="mr-3 text-yellow-600" />
                  <div>
                    <p className="font-medium">Asesoría Telefónica</p>
                    <p className="text-sm text-gray-600">+54 9 11 2321-3938</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail size={20} className="mr-3 text-yellow-600" />
                  <div>
                    <p className="font-medium">Soporte por Email</p>
                    <p className="text-sm text-gray-600">contacto@suplechad.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MessageCircle size={20} className="mr-3 text-green-500" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-gray-600">Respuesta inmediata</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantees Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Shield className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">100% Garantía</h3>
            <p className="text-gray-600 text-sm">Productos originales con garantía de calidad y frescura</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Expertos Certificados</h3>
            <p className="text-gray-600 text-sm">Nuestro equipo cuenta con certificaciones en nutrición deportiva</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Heart className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Atención Personalizada</h3>
            <p className="text-gray-600 text-sm">Te ayudamos a elegir los mejores productos para tus objetivos</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {[
              {
                question: "¿Cómo sé qué suplementos necesito?",
                answer: "Utiliza nuestra Calculadora de Nutrición Deportiva para obtener recomendaciones personalizadas. También puedes contactar a nuestros expertos para asesoría personalizada gratuita."
              },
              {
                question: "¿Los productos son originales y seguros?",
                answer: "Sí, todos nuestros productos son 100% originales y cuentan con las certificaciones necesarias. Trabajamos directamente con las marcas más reconocidas del mercado."
              },
              {
                question: "¿Cuándo veré resultados con los suplementos?",
                answer: "Los resultados varían según el producto y tus objetivos. Generalmente, con proteínas y creatina puedes notar mejoras en 2-4 semanas con entrenamiento constante."
              },
              {
                question: "¿Ofrecen planes de nutrición personalizados?",
                answer: "Sí, nuestros nutricionistas deportivos pueden crear planes personalizados. Contacta nuestro servicio de asesoría para más información."
              },
              {
                question: "¿Qué política de devolución tienen?",
                answer: "Ofrecemos 30 días para devolver productos en perfecto estado. Tu satisfacción es nuestra prioridad."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-2 text-gray-800">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-black mb-4">¿Necesitas ayuda específica?</h2>
          <p className="text-black mb-6">
            Nuestros expertos están listos para ayudarte a alcanzar tus objetivos fitness
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5491123213938"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Contactar por WhatsApp
            </a>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              Ver Nuestros Productos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
  };
  
  export default TechnicalSupportPage;