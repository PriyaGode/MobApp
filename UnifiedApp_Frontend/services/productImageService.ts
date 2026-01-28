import { CUSTOMER_API_BASE_URL } from '../config';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  type: 'card' | 'hero' | 'gallery';
}

export const getProductImages = async (productId?: string): Promise<ProductImage[]> => {
  try {
    const endpoint = productId 
      ? `/api/products/${productId}/images`
      : '/api/products/images';
    
    const response = await fetch(`${CUSTOMER_API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`Product images API returned ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log('Product images API not available, using fallback');
    return [];
  }
};