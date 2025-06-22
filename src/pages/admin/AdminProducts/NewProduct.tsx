import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { X, Plus } from 'lucide-react';
import { db } from '../../../firebase/config';
import { useToast } from '../../../contexts/ToastContext';

const NewProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    weight: '',
    stock: '',
    image: '',
    isOnSale: false,
    salePrice: '',
    isCombo: false,
    isFeatured: false,
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [customFlavor, setCustomFlavor] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const categories = [
    'Proteínas',
    'Pre-entrenos',
    'Creatinas',
    'Quemadores de Grasa',
    'Vitaminas',
    'Colágeno',
    'Aminoácidos',
    'Omega 3',
    'Minerales',
    'Otros'
  ];

  const subcategories = {
    'Proteínas': ['Whey Protein', 'Caseína', 'Proteína Vegetal', 'Proteína de Huevo'],
    'Pre-entrenos': ['Estimulantes', 'Sin Estimulantes', 'Pump', 'Focus'],
    'Creatinas': ['Monohidrato', 'HCL', 'Malato', 'Fosfato'],
    'Quemadores de Grasa': ['Termogénicos', 'Bloqueadores', 'Supresores'],
    'Vitaminas': ['Multivitamínicos', 'Vitamina C', 'Vitamina D', 'Vitamina B'],
    'Colágeno': ['Tipo I', 'Tipo II', 'Hidrolizado', 'Con Vitamina C'],
    'Aminoácidos': ['BCAA', 'Glutamina', 'Arginina', 'Taurina'],
    'Omega 3': ['EPA/DHA', 'Aceite de Pescado', 'Aceite de Krill'],
    'Minerales': ['Magnesio', 'Zinc', 'Calcio', 'Hierro'],
    'Otros': ['Probióticos', 'Enzimas', 'Antioxidantes']
  };

  const brands = [
    'Ena',
    'Gentech',
    'Incaico',
    'Optimum Nutrition',
    'Dymatize',
    'BSN',
    'Muscletech',
    'Universal Nutrition',
    'GNC',
    'MyProtein'
  ];

  const weights = [
    '250gr',
    '500gr',
    '1kg',
    '2kg',
    '5kg',
    '1lb',
    '2lb',
    '5lb'
  ];

  const availableFlavors = [
    'Chocolate',
    'Vainilla',
    'Fresa',
    'Banana',
    'Cookies & Cream',
    'Menta',
    'Limón',
    'Naranja',
    'Café Con Leche',
    'Sin Sabor'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      // Use custom values if they exist
      const finalSubcategory = showCustomSubcategory && customSubcategory ? customSubcategory : formData.subcategory;

      const productData = {
        ...formData,
        subcategory: finalSubcategory,
        flavors: selectedFlavors.length > 0 ? selectedFlavors : undefined, // Solo incluir si hay sabores seleccionados
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        createdAt: new Date()
      };

      // Remove empty fields
      Object.keys(productData).forEach(key => {
        if (productData[key as keyof typeof productData] === '' || productData[key as keyof typeof productData] === undefined) {
          delete productData[key as keyof typeof productData];
        }
      });

      await addDoc(collection(db, 'products'), productData);
      addToast('Producto creado exitosamente', 'success');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error al crear producto:', error);
      addToast('Error al crear el producto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'subcategory') {
      if (value === 'custom') {
        setShowCustomSubcategory(true);
        setFormData(prev => ({ ...prev, subcategory: '' }));
      } else {
        setShowCustomSubcategory(false);
        setCustomSubcategory('');
        setFormData(prev => ({ ...prev, subcategory: value }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const addFlavor = (flavor: string) => {
    if (!selectedFlavors.includes(flavor)) {
      setSelectedFlavors(prev => [...prev, flavor]);
    }
  };

  const removeFlavor = (flavor: string) => {
    setSelectedFlavors(prev => prev.filter(f => f !== flavor));
  };

  const addCustomFlavor = () => {
    if (customFlavor.trim() && !selectedFlavors.includes(customFlavor.trim())) {
      setSelectedFlavors(prev => [...prev, customFlavor.trim()]);
      setCustomFlavor('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategoría
                </label>
                <div className="space-y-2">
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    disabled={!formData.category}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                    <option value="custom">Otro (especificar)</option>
                  </select>
                  
                  {showCustomSubcategory && (
                    <input
                      type="text"
                      placeholder="Especificar subcategoría personalizada"
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso
                </label>
                <select
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Seleccionar peso</option>
                  {weights.map(weight => (
                    <option key={weight} value={weight}>{weight}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sabores */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sabores</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Sabores Disponibles
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {availableFlavors.map(flavor => (
                    <button
                      key={flavor}
                      type="button"
                      onClick={() => addFlavor(flavor)}
                      disabled={selectedFlavors.includes(flavor)}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        selectedFlavors.includes(flavor)
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Agregar sabor personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar Sabor Personalizado
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribir sabor personalizado"
                    value={customFlavor}
                    onChange={(e) => setCustomFlavor(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addCustomFlavor}
                    disabled={!customFlavor.trim()}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Sabores seleccionados */}
              {selectedFlavors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sabores Seleccionados
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlavors.map(flavor => (
                      <span
                        key={flavor}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                      >
                        {flavor}
                        <button
                          type="button"
                          onClick={() => removeFlavor(flavor)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Precios y Stock */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Precios y Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Oferta
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Opciones Especiales */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opciones Especiales</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label className="ml-2 text-sm text-gray-700">En Oferta</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isCombo"
                  checked={formData.isCombo}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label className="ml-2 text-sm text-gray-700">Es un Combo</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label className="ml-2 text-sm text-gray-700">Destacado</label>
              </div>
            </div>
          </div>

          {/* Imagen y Descripción */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen y Descripción</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Imagen *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas (separadas por comas)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="proteína, whey, chocolate"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:bg-yellow-300"
            >
              {isLoading ? 'Creando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;