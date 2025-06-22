import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { db } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  description: string;
  createdAt: {
    toDate: () => Date;
  };
  subcategory?: string;
  brand?: string;
  isOnSale?: boolean;
  salePrice?: number;
  isFeatured?: boolean;
  isCombo?: boolean;
}

const PRODUCTS_PER_PAGE = 10;

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [firstVisible, setFirstVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadProducts = async (isNextPage = false, isPrevPage = false) => {
    try {
      setIsLoading(true);
      
      let productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      if (isNextPage && lastVisible) {
        productsQuery = query(
          productsQuery,
          startAfter(lastVisible),
          limit(PRODUCTS_PER_PAGE)
        );
      } else if (isPrevPage && firstVisible) {
        productsQuery = query(
          productsQuery,
          limit(PRODUCTS_PER_PAGE * (currentPage - 1))
        );
      } else {
        productsQuery = query(
          productsQuery,
          limit(PRODUCTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(productsQuery);
      
      if (!snapshot.empty) {
        const productList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setProducts(productList);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setFirstVisible(snapshot.docs[0]);
        
        const totalSnapshot = await getDocs(collection(db, 'products'));
        setTotalPages(Math.ceil(totalSnapshot.size / PRODUCTS_PER_PAGE));
      } else {
        setProducts([]);
      }
      
      const categoriesSet = new Set<string>();
      const categoriesSnapshot = await getDocs(collection(db, 'products'));
      categoriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category) {
          categoriesSet.add(data.category);
        }
      });
      setCategories(Array.from(categoriesSet));
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      addToast('Error al cargar productos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      loadProducts(true, false);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      loadProducts(false, true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm) {
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filteredProducts);
    } else {
      loadProducts();
    }
  };

  const handleFilterChange = (category: string) => {
    setFilterCategory(category);
    
    if (category) {
      const filteredProducts = products.filter(product => 
        product.category === category
      );
      setProducts(filteredProducts);
    } else {
      loadProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      return;
    }
    
    try {
      setIsDeleting(id);
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(product => product.id !== id));
      addToast('Producto eliminado exitosamente', 'success');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      addToast('Error al eliminar producto', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : true;
    
    const matchesCategory = filterCategory 
      ? product.category === filterCategory 
      : true;
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button 
          onClick={handleAddProduct}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Agregar Producto
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Búsqueda y Filtros */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </form>
            
            <div className="w-full md:w-48">
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="appearance-none w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Todas las Categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Filter size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="ml-4 w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="w-20 h-8 bg-gray-200 rounded animate-pulse ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                      {product.subcategory && (
                        <div className="text-xs text-gray-500">{product.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.brand || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {product.isOnSale && product.salePrice ? (
                          <div>
                            <span className="line-through text-gray-500">${product.price.toFixed(2)}</span>
                            <span className="text-red-600 font-semibold ml-2">${product.salePrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          `$${product.price.toFixed(2)}`
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? product.stock : 'Sin stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {product.isOnSale && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Oferta
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Destacado
                          </span>
                        )}
                        {product.isCombo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Combo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting === product.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {isDeleting === product.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1 || isLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Anterior
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages || isLoading}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;