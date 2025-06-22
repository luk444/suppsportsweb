import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy 
} from 'firebase/firestore';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Save,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';
import { ProductSection, Product } from '../../types';

const AdminSections: React.FC = () => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ProductSection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'category' as 'category' | 'brand' | 'sale' | 'combo' | 'featured',
    products: [] as string[],
    isActive: true,
    sortOrder: 0
  });
  const { addToast } = useToast();

  const sectionTypes = [
    { value: 'category', label: 'Categoría' },
    { value: 'brand', label: 'Marca' },
    { value: 'sale', label: 'Ofertas' },
    { value: 'combo', label: 'Combos' },
    { value: 'featured', label: 'Destacados' }
  ];

  useEffect(() => {
    loadSections();
    loadProducts();
  }, []);

  const loadSections = async () => {
    try {
      const sectionsQuery = query(collection(db, 'productSections'), orderBy('sortOrder'));
      const snapshot = await getDocs(sectionsQuery);
      const sectionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductSection[];
      setSections(sectionsList);
    } catch (error) {
      console.error('Error al cargar secciones:', error);
      addToast('Error al cargar secciones', 'error');
    }
  };

  const loadProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      addToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('El nombre es requerido', 'error');
      return;
    }

    try {
      const sectionData = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        createdAt: editingSection ? editingSection.createdAt : new Date()
      };

      if (editingSection) {
        await updateDoc(doc(db, 'productSections', editingSection.id), sectionData);
        addToast('Sección actualizada exitosamente', 'success');
      } else {
        await addDoc(collection(db, 'productSections'), sectionData);
        addToast('Sección creada exitosamente', 'success');
      }

      setIsModalOpen(false);
      setEditingSection(null);
      resetForm();
      loadSections();
    } catch (error) {
      console.error('Error al guardar sección:', error);
      addToast('Error al guardar sección', 'error');
    }
  };

  const handleEdit = (section: ProductSection) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      slug: section.slug,
      description: section.description || '',
      type: section.type,
      products: section.products,
      isActive: section.isActive,
      sortOrder: section.sortOrder
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta sección?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'productSections', id));
      addToast('Sección eliminada exitosamente', 'success');
      loadSections();
    } catch (error) {
      console.error('Error al eliminar sección:', error);
      addToast('Error al eliminar sección', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'category',
      products: [],
      isActive: true,
      sortOrder: 0
    });
  };

  const openModal = () => {
    setEditingSection(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    resetForm();
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  const getSectionTypeLabel = (type: string) => {
    return sectionTypes.find(t => t.value === type)?.label || type;
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Producto no encontrado';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Secciones de Productos</h1>
        <button 
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Nueva Sección
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Productos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{section.name}</div>
                        {section.description && (
                          <div className="text-sm text-gray-500">{section.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getSectionTypeLabel(section.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {section.products.length} productos
                      </div>
                      {section.products.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {section.products.slice(0, 2).map(id => getProductName(id)).join(', ')}
                          {section.products.length > 2 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        section.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {section.sortOrder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(section)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="auto-generado"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  >
                    {sectionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activa</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productos
                </label>
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  {products.length > 0 ? (
                    <div className="space-y-2">
                      {products.map(product => (
                        <label key={product.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.products.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {product.name} - ${product.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay productos disponibles</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Save size={16} className="mr-1" />
                  {editingSection ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSections; 