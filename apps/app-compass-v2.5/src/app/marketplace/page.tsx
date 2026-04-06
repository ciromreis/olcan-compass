'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { medusaClient, MedusaProduct, getProductPrice, isInStock } from '@/lib/medusa-client';
import { useAuth } from '@olcan/shared-auth/react';

export default function MarketplacePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<MedusaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { limit: 24 };
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }

      const { products: fetchedProducts } = await medusaClient.listProducts(params);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Não foi possível carregar os produtos. Verifique se o backend está rodando.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      const { products: searchResults } = await medusaClient.searchProducts(searchQuery);
      setProducts(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  }

  function handleProductClick(product: MedusaProduct) {
    router.push(`/marketplace/${product.handle}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Marketplace Olcan
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Produtos e serviços para sua jornada de internacionalização
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors font-medium"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando produtos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                        rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum produto encontrado.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const price = getProductPrice(product);
              const inStock = isInStock(product);

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 
                           dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg 
                           transition-shadow"
                >
                  {/* Product Image */}
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">
                          Sem imagem
                        </span>
                      </div>
                    )}
                    {!inStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 
                                    rounded text-xs font-medium">
                        Esgotado
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {product.title}
                    </h3>
                    
                    {product.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {product.subtitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {price.formatted}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        disabled={!inStock}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          inStock
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {inStock ? 'Ver detalhes' : 'Indisponível'}
                      </button>
                    </div>

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 
                                     dark:text-gray-300 text-xs rounded"
                          >
                            {tag.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Authentication Notice */}
      {!isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                        rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200">
              💡 Faça login para acessar recursos exclusivos e gerenciar suas compras.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
