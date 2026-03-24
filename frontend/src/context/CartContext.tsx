import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "titanium_cart_items";

export interface CartProduct {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  addItem: (product: CartProduct) => void;
  updateQuantity: (productId: CartItem["id"], quantity: number) => void;
  removeItem: (productId: CartItem["id"]) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedItems) return;

    try {
      const parsed = JSON.parse(storedItems) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: CartProduct) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: CartItem["id"], quantity: number) => {
    if (quantity < 1) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId)
      );
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: CartItem["id"]) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value = useMemo<CartContextType>(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      isCartOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [isCartOpen, items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }

  return context;
}
