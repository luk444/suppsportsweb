import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProductCard from '../../components/product/ProductCard';
import { Product } from '../../types';
import { Filter, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    flavors: true,
    subcategories: true,
    offers: true,
    price: true,
    sort: true
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [showOnlyOffers, setShowOnlyOffers] = useState(searchParams.get('offers') === 'true');
  const [showOnlyCombos, setShowOnlyCombos] = useState(searchParams.get('combos') === 'true');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');

  // Obtener productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsRef = collection(db, 'products');
        const q = query(productsRef, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Expandir secciones automáticamente basado en parámetros de URL
  useEffect(() => {
    const offersParam = searchParams.get('offers');
    const combosParam = searchParams.get('combos');
    
    // Actualizar estados de filtros basado en parámetros de URL
    setShowOnlyOffers(offersParam === 'true');
    setShowOnlyCombos(combosParam === 'true');
    
    // Expandir sección si hay filtros activos
    if (offersParam === 'true' || combosParam === 'true') {
      setExpandedSections(prev => ({
        ...prev,
        offers: true
      }));
    }
  }, [searchParams]);

  // Calcular opciones de filtros
  const filterOptions = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter((c): c is string => Boolean(c)))];
    const brands = [...new Set(products.map(p => p.brand).filter((b): b is string => Boolean(b)))];
    const flavors = [...new Set(products.flatMap(p => p.flavor ? [p.flavor] : []))];
    const subcategories = [...new Set(products.map(p => p.subcategory).filter((s): s is string => Boolean(s)))];

    return { categories, brands, flavors, subcategories };
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.brand && product.brand.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }

    // Filtro de categorías
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        product.category && selectedCategories.includes(product.category)
      );
    }

    // Filtro de marcas
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        product.brand && selectedBrands.includes(product.brand)
      );
    }

    // Filtro de sabores
    if (selectedFlavors.length > 0) {
      filtered = filtered.filter(product =>
        product.flavor && selectedFlavors.includes(product.flavor)
      );
    }

    // Filtro de subcategorías
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(product =>
        product.subcategory && selectedSubcategories.includes(product.subcategory)
      );
    }

    // Filtro de ofertas
    if (showOnlyOffers) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // Filtro de combos
    if (showOnlyCombos) {
      filtered = filtered.filter(product => product.isCombo);
    }

    // Filtro de precio
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return (a.isOnSale && a.salePrice ? a.salePrice : a.price) - 
                 (b.isOnSale && b.salePrice ? b.salePrice : b.price);
        case 'price-high':
          return (b.isOnSale && b.salePrice ? b.salePrice : b.price) - 
                 (a.isOnSale && a.salePrice ? a.salePrice : a.price);
        case 'newest':
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategories, selectedBrands, selectedFlavors, 
      selectedSubcategories, showOnlyOffers, showOnlyCombos, priceRange, sortBy]);

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedFlavors([]);
    setSelectedSubcategories([]);
    setShowOnlyOffers(false);
    setShowOnlyCombos(false);
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
    
    // Limpiar URL
    setSearchParams(new URLSearchParams());
  };

  // Contar productos por filtro
  const getFilterCount = (filterType: string, value: string) => {
    return products.filter(product => {
      switch (filterType) {
        case 'category':
          return product.category === value;
        case 'brand':
          return product.brand && product.brand === value;
        case 'flavor':
          return product.flavor && product.flavor === value;
        case 'subcategory':
          return product.subcategory && product.subcategory === value;
        default:
          return false;
      }
    }).length;
  };

  // Toggle sección expandida
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || 
    selectedBrands.length > 0 || selectedFlavors.length > 0 || 
    selectedSubcategories.length > 0 || showOnlyOffers || showOnlyCombos || 
    priceRange.min || priceRange.max;

  if (loading) {
    return (
      <div className="products-page">
        <div className="container mx-auto px-4">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="products-header">
          <h1 className="products-title">Nuestros Productos</h1>
          <p className="products-subtitle">
            Encuentra los mejores suplementos deportivos para alcanzar tus objetivos
          </p>
        </div>

        <div className="products-container">
          {/* Mobile Filter Toggle */}
          <div className="mobile-filter-toggle">
            <button
              className="mobile-filter-button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <span>Filtros</span>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span className="filter-badge">
                    {[searchTerm, selectedCategories, selectedBrands, selectedFlavors, 
                      selectedSubcategories, showOnlyOffers, showOnlyCombos, priceRange.min, priceRange.max]
                      .flat().filter(Boolean).length}
                  </span>
                )}
                <Filter size={16} />
              </div>
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`filters-sidebar ${isMobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="filters-header">
              <h3>Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="clear-filters-button"
                >
                  <X size={14} />
                  Limpiar
                </button>
              )}
            </div>

            {/* Búsqueda */}
            <div className="filter-section">
              <div className="filter-title">Búsqueda</div>
              <form onSubmit={(e) => e.preventDefault()} className="search-form">
                <div className="search-input-wrapper">
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            </div>

            {/* Categorías */}
            {filterOptions.categories.length > 0 && (
              <div className="filter-section">
                <button
                  className="filter-section-header"
                  onClick={() => toggleSection('categories')}
                >
                  <span className="filter-title">Categorías</span>
                  {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.categories && (
                  <div className="filter-options">
                    {filterOptions.categories.map((category) => (
                      <label key={category} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="filter-checkbox-input"
                        />
                        <span className="filter-checkbox-label">{category}</span>
                        <span className="filter-count">({getFilterCount('category', category)})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Marcas */}
            {filterOptions.brands.length > 0 && (
              <div className="filter-section">
                <button
                  className="filter-section-header"
                  onClick={() => toggleSection('brands')}
                >
                  <span className="filter-title">Marcas</span>
                  {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.brands && (
                  <div className="filter-options">
                    {filterOptions.brands.map((brand) => (
                      <label key={brand} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                          }}
                          className="filter-checkbox-input"
                        />
                        <span className="filter-checkbox-label">{brand}</span>
                        <span className="filter-count">({getFilterCount('brand', brand)})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sabores - Solo mostrar si hay más de un sabor */}
            {filterOptions.flavors.length > 1 && (
              <div className="filter-section">
                <button
                  className="filter-section-header"
                  onClick={() => toggleSection('flavors')}
                >
                  <span className="filter-title">Sabores</span>
                  {expandedSections.flavors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.flavors && (
                  <div className="filter-options">
                    {filterOptions.flavors.map((flavor) => (
                      <label key={flavor} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedFlavors.includes(flavor)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFlavors([...selectedFlavors, flavor]);
                            } else {
                              setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
                            }
                          }}
                          className="filter-checkbox-input"
                        />
                        <span className="filter-checkbox-label">{flavor}</span>
                        <span className="filter-count">({getFilterCount('flavor', flavor)})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Subcategorías */}
            {filterOptions.subcategories.length > 0 && (
              <div className="filter-section">
                <button
                  className="filter-section-header"
                  onClick={() => toggleSection('subcategories')}
                >
                  <span className="filter-title">Subcategorías</span>
                  {expandedSections.subcategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {expandedSections.subcategories && (
                  <div className="filter-options">
                    {filterOptions.subcategories.map((subcategory) => (
                      <label key={subcategory} className="filter-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(subcategory)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubcategories([...selectedSubcategories, subcategory]);
                            } else {
                              setSelectedSubcategories(selectedSubcategories.filter(s => s !== subcategory));
                            }
                          }}
                          className="filter-checkbox-input"
                        />
                        <span className="filter-checkbox-label">{subcategory}</span>
                        <span className="filter-count">({getFilterCount('subcategory', subcategory)})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ofertas y Combos */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('offers')}
              >
                <span className="filter-title">Ofertas y Combos</span>
                {expandedSections.offers ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.offers && (
                <div className="filter-options">
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={showOnlyOffers}
                      onChange={(e) => setShowOnlyOffers(e.target.checked)}
                      className="filter-checkbox-input"
                    />
                    <span className="filter-checkbox-label">Solo ofertas</span>
                    <span className="filter-count">
                      ({products.filter(p => p.isOnSale).length})
                    </span>
                  </label>
                  <label className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={showOnlyCombos}
                      onChange={(e) => setShowOnlyCombos(e.target.checked)}
                      className="filter-checkbox-input"
                    />
                    <span className="filter-checkbox-label">Solo combos</span>
                    <span className="filter-count">
                      ({products.filter(p => p.isCombo).length})
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Rango de precio */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('price')}
              >
                <span className="filter-title">Rango de Precio</span>
                {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.price && (
                <div className="price-range">
                  <div className="price-input-group">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Máx"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="price-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Ordenar */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleSection('sort')}
              >
                <span className="filter-title">Ordenar por</span>
                {expandedSections.sort ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.sort && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Nombre A-Z</option>
                  <option value="price-low">Precio: Menor a Mayor</option>
                  <option value="price-high">Precio: Mayor a Menor</option>
                  <option value="newest">Más Recientes</option>
                </select>
              )}
            </div>
          </div>

          {/* Products Content */}
          <div className="products-content">
            {/* Results Info */}
            <div className="products-results">
              <p>
                Mostrando {filteredProducts.length} de {products.length} productos
                {hasActiveFilters && ' (filtrados)'}
              </p>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No se encontraron productos con los filtros seleccionados.</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;