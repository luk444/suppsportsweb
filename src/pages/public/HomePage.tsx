import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CreditCard, Percent, ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProductCard from '../../components/product/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

// Hook para detectar dispositivos móviles
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Slider images data
  const sliderImages = [
    {
      id: 1,
      image: "https://i.blogs.es/863b33/1366_2000-10-/1366_2000.jpeg",
      title: "ENCONTRÁ SUPLEMENTOS DEPORTIVOS",
      subtitle: "Descubre la mejor selección de suplementos deportivos de calidad premium",
      cta: "Ver Productos",
      overlay: "from-black/80 via-black/50 to-black/30"
    },
    {
      id: 2,
      image: "https://as01.epimg.net/deporteyvida/imagenes/2017/09/14/portada/1505386943_088301_1505387093_noticia_normal.jpg",
      title: "LAS MEJORES MARCAS NACIONALES E INTERNACIONALES",
      subtitle: "Productos de las marcas más reconocidas del mercado deportivo",
      cta: "Explorar Marcas",
      overlay: "from-black/80 via-black/50 to-black/30"
    },
    {
      id: 3,
      image: "https://estaticos-cdn.prensaiberica.es/clip/996bef03-7ae6-4f73-9d79-bcf5ba5fd019_16-9-discover-aspect-ratio_default_0.jpg",
      title: "CALIDAD PREMIUM GARANTIZADA",
      subtitle: "Suplementos certificados con los más altos estándares de calidad",
      cta: "Descubrir Calidad",
      overlay: "from-black/80 via-black/50 to-black/30"
    }
  ];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(4)
        );
        
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      setProgressKey(prev => prev + 1);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderImages.length]);

  // Pause auto-play on hover
  const handleSliderHover = () => setIsAutoPlaying(false);
  const handleSliderLeave = () => setIsAutoPlaying(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    setProgressKey(prev => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    setProgressKey(prev => prev + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgressKey(prev => prev + 1);
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const handleResetVideo = () => {
    setIsVideoPlaying(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Hero Slider Section */}
      <section 
        className="relative h-[700px] md:h-[800px] overflow-hidden hero-slider"
        onMouseEnter={handleSliderHover}
        onMouseLeave={handleSliderLeave}
      >
        {/* Slider Container */}
        <div 
          ref={sliderRef}
          className="relative w-full h-full"
        >
          {sliderImages.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 8s ease-out'
                }}
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

              {/* Content */}
              <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
                <div className="text-white max-w-2xl">
                  <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight tracking-tight transition-opacity duration-1000 delay-300 ${
                    index === currentSlide 
                      ? 'opacity-100' 
                      : 'opacity-0'
                  }`}>
                    {slide.title}
                  </h1>
                  <p className={`text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 max-w-lg transition-opacity duration-1000 delay-500 ${
                    index === currentSlide 
                      ? 'opacity-100' 
                      : 'opacity-0'
                  }`}>
                    {slide.subtitle}
                  </p>
                  <Link 
                    to="/products" 
                    className={`inline-flex items-center px-8 md:px-10 py-4 md:py-5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg md:text-xl rounded-xl transition-colors duration-300 shadow-2xl hover:shadow-yellow-400/50 transition-opacity duration-1000 delay-700 ${
                      index === currentSlide 
                        ? 'opacity-100' 
                        : 'opacity-0'
                    }`}
                  >
                    {slide.cta} <ArrowRight className="ml-3 w-5 h-5 md:w-6 md:h-6" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2  z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-colors duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Slide Indicators with Progress Bars */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                {/* Progress bar for current slide */}
                {index === currentSlide && (
                  <div 
                    key={progressKey}
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300 ease-linear"
                    style={{
                      animation: 'progressBar 5s linear'
                    }}
                  ></div>
                )}
                {/* Hover effect for inactive slides */}
                {index !== currentSlide && (
                  <div className="h-full bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Shipping */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-gray-100 p-4 rounded-full">
                <Truck className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Envío GRATIS</h3>
                <p className="text-gray-600 text-sm">a todo el País para compras Mayores a $50.000</p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-gray-100 p-4 rounded-full">
                <CreditCard className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Aceptamos todas las Tarjetas</h3>
                <p className="text-gray-600 text-sm">Tarjetas de Crédito y Débito, Rapipago, Pago Fácil y en Cuotas</p>
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-gray-100 p-4 rounded-full">
                <Percent className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">5% Descuento</h3>
                <p className="text-gray-600 text-sm">Pagando con Transferencia Bancaria</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Suplementos + Más Vendidos</h2>
          
          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Placeholder products */}
              {[
                { name: "Proteína Whey Premium", price: 15900, image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
                { name: "Creatina Monohidrato", price: 8500, image: "https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
                { name: "BCAA + Glutamina", price: 12300, image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" },
                { name: "Pre-Entreno Ultra", price: 18900, image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" }
              ].map((product, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-64"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-xl font-bold">${product.price.toLocaleString()}</p>
                    <Link
                      to="/products"
                      className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded transition-colors duration-200 inline-block text-center"
                    >
                      Ver Producto
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors duration-200"
            >
              Ver Todos los Productos <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Comprar por Categoría</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src="https://www.gentech.com.ar/web/image/product.template/11267/image_512/%5BGTWPCAP500%5D%20WHEY%20PROTEIN%207900%20CAPUCCINO?unique=f9ce0af"
                alt="Proteínas" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">Proteínas</h3>
                  <Link 
                    to="/products?category=proteinas" 
                    className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Ver Productos <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src="https://www.gentech.com.ar/web/image/product.template/11267/image_512/%5BGTWPCAP500%5D%20WHEY%20PROTEIN%207900%20CAPUCCINO?unique=f9ce0af"
                alt="Creatinas" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">Creatinas</h3>
                  <Link 
                    to="/products?category=creatinas" 
                    className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Ver Productos <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg aspect-square">
              <img 
                src="https://www.gentech.com.ar/web/image/product.template/11267/image_512/%5BGTWPCAP500%5D%20WHEY%20PROTEIN%207900%20CAPUCCINO?unique=f9ce0af"
                alt="Pre-entrenos" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">Pre-entrenos</h3>
                  <Link 
                    to="/products?category=pre-entrenos" 
                    className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Ver Productos <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section with White Background - Moved before Newsletter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Productos de Calidad Premium
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubre nuestra amplia selección de suplementos deportivos de las mejores marcas del mercado
              </p>
            </div>

            {/* Video Container */}
            <div className="relative max-w-4xl mx-auto">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                {isVideoPlaying ? (
                  // Video iframe when playing
                  <div className="relative w-full h-full">
                    <iframe
                      src="https://www.youtube.com/embed/CCAoFTxWHFY?autoplay=1&rel=0&modestbranding=1"
                      title="Video de Productos de Calidad Premium"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    
                    {/* Reset button overlay */}
                    <button
                      onClick={handleResetVideo}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 z-10"
                      title="Volver al thumbnail"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  // Video thumbnail when not playing
                  <div className="relative w-full h-full">
                    <img 
                      src="https://img.youtube.com/vi/MRGXXzwaXNI/maxresdefault.jpg"
                      alt="Video de Productos de Calidad Premium"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <button
                        onClick={handlePlayVideo}
                        className="group relative bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-colors duration-300 play-button"
                      >
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                        <Play 
                          className="w-16 h-16 text-white fill-white relative z-10 ml-1" 
                          size={64}
                        />
                      </button>
                    </div>

                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <h3 className="text-white text-xl font-semibold mb-2">
                        Conoce Nuestros Productos
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Descubre la calidad y variedad de suplementos que ofrecemos
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">500+</div>
                  <div className="text-gray-700">Productos Disponibles</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">50+</div>
                  <div className="text-gray-700">Marcas Premium</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-yellow-500 mb-2">24/7</div>
                  <div className="text-gray-700">Atención al Cliente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Suscríbete a Nuestro Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Recibe las últimas ofertas, nuevos productos y consejos de nutrición deportiva directamente en tu email.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 mx-auto max-w-md">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-grow px-4 py-3 rounded-md text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md transition-colors duration-200"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/5491123213938"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 rounded-full w-14 h-14 p-0 flex items-center justify-center transition-colors duration-200"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default HomePage;