const LOCAL_IMAGE_KEY_PREFIX = 'billmaster_prod_img_';

export interface ProductImagePreset {
  id: string;
  name: string;
  url: string;
}

// Presets using existing store Cloudinary assets from dplye41hy account
export const POPULAR_IMAGE_PRESETS: ProductImagePreset[] = [
  {
    id: 'balaji-wafers',
    name: 'Balaji Wafers',
    url: 'https://res.cloudinary.com/dplye41hy/image/upload/v1788769450/product_images/lhxg9rddvickxyayxdm0.jpg',
  },
  {
    id: 'krackjack',
    name: 'Krackjack Biscuit',
    url: 'https://res.cloudinary.com/dplye41hy/image/upload/v1787924767/product_images/ctjbbexgpsfzwbkpbdk3.jpg',
  },
  {
    id: 'ponds',
    name: 'Ponds Cream',
    url: 'https://res.cloudinary.com/dplye41hy/image/upload/v1787903521/product_images/iq9y0t7orwjbam5qp3yz.jpg',
  },
  {
    id: 'headoil',
    name: 'Head Oil',
    url: 'https://res.cloudinary.com/dplye41hy/image/upload/v1787903573/product_images/lsuozsy7yhrch6qdmr16.jpg',
  },
  {
    id: 'groceries',
    name: 'Groceries / Pack',
    url: 'https://res.cloudinary.com/dplye41hy/image/upload/v1788526821/product_images/oiedtixxrfe9glzbqc9a.jpg',
  },
];

/**
 * Save user's uploaded image to client storage
 */
export function saveLocalProductImage(idOrBarcode: string, dataUrl: string): void {
  if (!idOrBarcode || !dataUrl) return;
  try {
    localStorage.setItem(LOCAL_IMAGE_KEY_PREFIX + idOrBarcode, dataUrl);
  } catch (err) {
    console.warn('LocalStorage limit reached for product image:', err);
  }
}

/**
 * Retrieve user's uploaded image from client storage
 */
export function getLocalProductImage(idOrBarcode?: string | null): string | null {
  if (!idOrBarcode) return null;
  try {
    return localStorage.getItem(LOCAL_IMAGE_KEY_PREFIX + idOrBarcode);
  } catch {
    return null;
  }
}
