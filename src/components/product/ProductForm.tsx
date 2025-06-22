import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';
import { v4 as uuidv4 } from 'uuid';

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: {
    id: string;
    name: string;
    price: number;
    description: string;
    category: string;
    stock: number;
    image: string;
  };
}

interface FormValues {
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  image: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ mode, product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      name: product?.name || '',
      price: product?.price || 0,
      description: product?.description || '',
      category: product?.category || '',
      stock: product?.stock || 0,
      image: product?.image || ''
    }
  });
  const { addToast } = useToast();
  const navigate = useNavigate();
  const imageUrl = watch('image');

  const onSubmit = async (data: FormValues) => {
    if (!data.image) {
      addToast('Por favor ingrese una URL de imagen válida', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      const productData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (mode === 'create') {
        await addDoc(collection(db, 'products'), productData);
        addToast('Producto creado exitosamente', 'success');
      } else if (mode === 'edit' && product) {
        await updateDoc(doc(db, 'products', product.id), productData);
        addToast('Producto actualizado exitosamente', 'success');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      addToast('Error al guardar el producto. Por favor intente nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'Partes de Motor',
    'Transmisión',
    'Sistema de Frenos',
    'Suspensión',
    'Sistema Eléctrico',
    'Escape',
    'Sistema de Refrigeración',
    'Carrocería',
    'Interior',
    'Accesorios'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* URL de Imagen */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
        <div className="space-y-2">
          <input
            type="url"
            placeholder="Ingrese la URL de la imagen"
            className={`block w-full rounded-md shadow-sm p-2 border ${
              errors.image ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('image', { required: 'La URL de la imagen es requerida' })}
          />
          {imageUrl && (
            <div className="relative w-32 h-32">
              <img 
                src={imageUrl} 
                alt="Vista previa" 
                className="w-32 h-32 object-cover rounded-md border"
                onError={() => {
                  addToast('Error al cargar la imagen. Verifique la URL.', 'error');
                  setValue('image', '');
                }}
              />
            </div>
          )}
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image.message}</p>
          )}
        </div>
      </div>

      {/* Nombre del Producto */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre del Producto
        </label>
        <input
          id="name"
          type="text"
          className={`block w-full rounded-md shadow-sm p-2 border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('name', { required: 'El nombre del producto es requerido' })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Precio y Stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Precio ($)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            className={`block w-full rounded-md shadow-sm p-2 border ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('price', { 
              required: 'El precio es requerido',
              min: { value: 0, message: 'El precio debe ser positivo' },
              valueAsNumber: true
            })}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            id="stock"
            type="number"
            min="0"
            className={`block w-full rounded-md shadow-sm p-2 border ${
              errors.stock ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('stock', { 
              required: 'La cantidad de stock es requerida',
              min: { value: 0, message: 'El stock no puede ser negativo' },
              valueAsNumber: true
            })}
          />
          {errors.stock && (
            <p className="text-red-500 text-sm">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Categoría
        </label>
        <select
          id="category"
          className={`block w-full rounded-md shadow-sm p-2 border ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('category', { required: 'La categoría es requerida' })}
        >
          <option value="">Seleccionar Categoría</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">{errors.category.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción
        </label>
        <textarea
          id="description"
          rows={4}
          className={`block w-full rounded-md shadow-sm p-2 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          {...register('description', { required: 'La descripción es requerida' })}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:bg-primary-300"
        >
          {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Actualizar Producto'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ProductForm;