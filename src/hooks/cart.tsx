import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const savedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(p => p.id === product.id);
      // eslint-disable-next-line no-underscore-dangle
      const _products = Array.from(products);
      let arrayProducts = null;

      if (index >= 0) {
        const p = _products[index];
        _products.splice(index, 1);
        p.quantity += 1;

        arrayProducts = [..._products, p];
      } else {
        // eslint-disable-next-line no-param-reassign
        product.quantity = 1;
        arrayProducts = [...products, product];
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(arrayProducts),
      );
      setProducts(arrayProducts);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      // eslint-disable-next-line no-underscore-dangle
      const _products = Array.from(products);

      let arrayProducts = null || products;

      if (index >= 0) {
        const p = _products[index];
        _products.splice(index, 1);
        p.quantity += 1;
        arrayProducts = [..._products, p];
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(arrayProducts),
      );
      setProducts(arrayProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      // eslint-disable-next-line no-underscore-dangle
      const _products = Array.from(products);

      let arrayProducts = null || products;

      if (index >= 0) {
        const p = _products[index];
        if (p.quantity > 1) {
          _products.splice(index, 1);
          p.quantity -= 1;
          arrayProducts = [..._products, p];
        } else {
          _products.splice(index, 1);
          arrayProducts = [..._products];
        }
      }

      AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(arrayProducts),
      );
      setProducts(arrayProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
