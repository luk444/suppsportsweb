import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Target, Activity, Zap, ArrowRight, ShoppingCart } from 'lucide-react';

interface FormularioCalculadora {
  peso: string;
  altura: string;
  edad: string;
  genero: string;
  nivelActividad: string;
  objetivo: string;
}

interface ResultadosNutricion {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  agua: number;
}

interface RecomendacionSuplemento {
  categoria: string;
  objetivo: string;
  descripcion: string;
  icon: React.ReactNode;
  prioridad: 'alta' | 'media' | 'baja';
}

const VehicleFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const [datosFormulario, setDatosFormulario] = useState<FormularioCalculadora>({
    peso: '',
    altura: '',
    edad: '',
    genero: '',
    nivelActividad: '',
    objetivo: ''
  });

  const [resultados, setResultados] = useState<ResultadosNutricion | null>(null);

  const calcularNutricion = (): ResultadosNutricion => {
    const peso = parseFloat(datosFormulario.peso);
    const altura = parseFloat(datosFormulario.altura);
    const edad = parseFloat(datosFormulario.edad);
    
    // Calcular TMB (Tasa Metabólica Basal) usando la fórmula de Mifflin-St Jeor
    let tmb: number;
    if (datosFormulario.genero === 'masculino') {
      tmb = 10 * peso + 6.25 * altura - 5 * edad + 5;
    } else {
      tmb = 10 * peso + 6.25 * altura - 5 * edad - 161;
    }

    // Factores de actividad
    const factoresActividad: { [key: string]: number } = {
      sedentario: 1.2,
      ligero: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muyIntenso: 1.9
    };

    // Ajustar según objetivo
    const ajustesObjetivo: { [key: string]: number } = {
      perderPeso: 0.8,
      mantener: 1.0,
      ganarMusculo: 1.2
    };

    const factorActividad = factoresActividad[datosFormulario.nivelActividad] || 1.2;
    const ajusteObjetivo = ajustesObjetivo[datosFormulario.objetivo] || 1.0;
    
    const calorias = Math.round(tmb * factorActividad * ajusteObjetivo);
    const proteinas = Math.round((peso * 2.2)); // 2.2g por kg para deportistas
    const grasas = Math.round((calorias * 0.25) / 9); // 25% de calorías
    const carbohidratos = Math.round((calorias - (proteinas * 4) - (grasas * 9)) / 4);
    const agua = Math.round(peso * 35); // 35ml por kg

    return {
      calorias,
      proteinas,
      carbohidratos,
      grasas,
      agua
    };
  };

  const obtenerRecomendaciones = (): RecomendacionSuplemento[] => {
    const recomendaciones: RecomendacionSuplemento[] = [];

    // Recomendaciones base según objetivo
    if (datosFormulario.objetivo === 'ganarMusculo') {
      recomendaciones.push(
        {
          categoria: 'Proteínas',
          objetivo: 'Proteína Whey',
          descripcion: '25-30g post-entreno para recuperación muscular',
          icon: <Target className="w-6 h-6" />,
          prioridad: 'alta'
        },
        {
          categoria: 'Creatinas',
          objetivo: 'Creatina Monohidrato',
          descripcion: '3-5g diarios para fuerza y potencia',
          icon: <Zap className="w-6 h-6" />,
          prioridad: 'alta'
        },
        {
          categoria: 'Aminoácidos',
          objetivo: 'BCAA',
          descripcion: '10-15g durante el entrenamiento',
          icon: <Activity className="w-6 h-6" />,
          prioridad: 'media'
        }
      );
    } else if (datosFormulario.objetivo === 'perderPeso') {
      recomendaciones.push(
        {
          categoria: 'Quemadores de Grasa',
          objetivo: 'Termogénicos',
          descripcion: 'Ayudan a aumentar el metabolismo y quemar grasa',
          icon: <Zap className="w-6 h-6" />,
          prioridad: 'alta'
        },
        {
          categoria: 'Proteínas',
          objetivo: 'Proteína Whey',
          descripcion: 'Mantiene la masa muscular durante la pérdida de peso',
          icon: <Target className="w-6 h-6" />,
          prioridad: 'alta'
        },
        {
          categoria: 'Vitaminas',
          objetivo: 'Multivitamínicos',
          descripcion: 'Asegura una nutrición completa durante la dieta',
          icon: <Activity className="w-6 h-6" />,
          prioridad: 'media'
        }
      );
    } else {
      // Mantener peso
      recomendaciones.push(
        {
          categoria: 'Proteínas',
          objetivo: 'Proteína Whey',
          descripcion: 'Mantiene la masa muscular y recuperación',
          icon: <Target className="w-6 h-6" />,
          prioridad: 'alta'
        },
        {
          categoria: 'Vitaminas',
          objetivo: 'Multivitamínicos',
          descripcion: 'Asegura una nutrición completa',
          icon: <Activity className="w-6 h-6" />,
          prioridad: 'media'
        }
      );
    }

    // Recomendaciones adicionales según nivel de actividad
    if (datosFormulario.nivelActividad === 'intenso' || datosFormulario.nivelActividad === 'muyIntenso') {
      recomendaciones.push(
        {
          categoria: 'Pre-entrenos',
          objetivo: 'Pre-entreno',
          descripcion: 'Energía y enfoque para entrenamientos intensos',
          icon: <Zap className="w-6 h-6" />,
          prioridad: 'media'
        }
      );
    }

    return recomendaciones;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultadosCalculados = calcularNutricion();
    setResultados(resultadosCalculados);
  };

  const irACategoria = (categoria: string) => {
    navigate(`/products?category=${encodeURIComponent(categoria)}`);
  };

  const irATodosLosProductos = () => {
    navigate('/products');
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Calculadora de Nutrición Deportiva</h1>
        <p className="text-gray-600 mb-8">
          Calcula tus necesidades nutricionales personalizadas y descubre qué suplementos pueden ayudarte a alcanzar tus objetivos.
        </p>

        {!resultados ? (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    id="peso"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.peso}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, peso: e.target.value })}
                    placeholder="Ej: 70"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    id="altura"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.altura}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, altura: e.target.value })}
                    placeholder="Ej: 175"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-2">
                    Edad (años)
                  </label>
                  <input
                    type="number"
                    id="edad"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.edad}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, edad: e.target.value })}
                    placeholder="Ej: 25"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    id="genero"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.genero}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, genero: e.target.value })}
                    required
                  >
                    <option value="">Selecciona tu género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="nivelActividad" className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Actividad
                  </label>
                  <select
                    id="nivelActividad"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.nivelActividad}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, nivelActividad: e.target.value })}
                    required
                  >
                    <option value="">Selecciona tu nivel</option>
                    <option value="sedentario">Sedentario (poco o nada de ejercicio)</option>
                    <option value="ligero">Ligero (ejercicio ligero 1-3 días/semana)</option>
                    <option value="moderado">Moderado (ejercicio moderado 3-5 días/semana)</option>
                    <option value="intenso">Intenso (ejercicio intenso 6-7 días/semana)</option>
                    <option value="muyIntenso">Muy Intenso (ejercicio muy intenso, trabajo físico)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo
                  </label>
                  <select
                    id="objetivo"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-yellow-400 focus:outline-none"
                    value={datosFormulario.objetivo}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, objetivo: e.target.value })}
                    required
                  >
                    <option value="">Selecciona tu objetivo</option>
                    <option value="perderPeso">Perder Peso</option>
                    <option value="mantener">Mantener Peso</option>
                    <option value="ganarMusculo">Ganar Músculo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                >
                  <Calculator className="w-5 h-5" />
                  Calcular Necesidades
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Resultados */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Tus Necesidades Nutricionales</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{resultados.calorias}</div>
                  <div className="text-sm text-gray-600">Calorías</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{resultados.proteinas}g</div>
                  <div className="text-sm text-gray-600">Proteínas</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{resultados.carbohidratos}g</div>
                  <div className="text-sm text-gray-600">Carbohidratos</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{resultados.grasas}g</div>
                  <div className="text-sm text-gray-600">Grasas</div>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-cyan-600">{resultados.agua}ml</div>
                  <div className="text-sm text-gray-600">Agua</div>
                </div>
              </div>
            </div>

            {/* Recomendaciones de Suplementos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Recomendaciones de Suplementos</h2>
              
              <div className="space-y-4">
                {obtenerRecomendaciones().map((recomendacion, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-l-4 ${
                      recomendacion.prioridad === 'alta' 
                        ? 'bg-red-50 border-red-400' 
                        : recomendacion.prioridad === 'media'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          recomendacion.prioridad === 'alta' 
                            ? 'bg-red-100 text-red-600' 
                            : recomendacion.prioridad === 'media'
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {recomendacion.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{recomendacion.objetivo}</h3>
                          <p className="text-sm text-gray-600">{recomendacion.descripcion}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => irACategoria(recomendacion.categoria)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ver Productos
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={irATodosLosProductos}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Ver Todos los Productos
                  </button>
                  <button
                    onClick={() => setResultados(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Calcular Nuevamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleFinderPage;