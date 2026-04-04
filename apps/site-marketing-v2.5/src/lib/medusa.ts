export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function getProducts(options?: { category?: string, limit?: number }) {
  try {
    const query = new URLSearchParams();
    if (options?.limit) query.set('limit', options.limit.toString());
    
    // In Medusa v2, the public products endpoint is /store/products
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?${query.toString()}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Medusa products');
    }
    
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching Medusa products:', error);
    return []; // Fallback to empty
  }
}
