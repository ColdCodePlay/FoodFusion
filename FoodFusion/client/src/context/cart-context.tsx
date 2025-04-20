import { createContext, useContext, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartWithItems } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface CartContextValue {
  cart: CartWithItems | undefined;
  isLoading: boolean;
  addToCart: (item: CartItemAdd) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

interface CartProviderProps {
  children: ReactNode;
}

interface CartItemAdd {
  menuItemId: number;
  restaurantId: number;
  quantity: number;
  size: string;
  extras: string;
  instructions: string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: CartProviderProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Get cart data
  const { data: cart, isLoading } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
    enabled: true, // Always fetch cart, even for guests
  });
  
  // Add item to cart
  const addToCartMutation = useMutation({
    mutationFn: async (item: CartItemAdd) => {
      // If cart exists but restaurant is different, first create a new cart
      if (cart && cart.restaurantId !== item.restaurantId) {
        await apiRequest('POST', '/api/cart', {
          restaurantId: item.restaurantId
        });
      } else if (!cart) {
        // If no cart exists, create one first
        await apiRequest('POST', '/api/cart', {
          restaurantId: item.restaurantId
        });
      }
      
      // Add item to cart
      return apiRequest('POST', '/api/cart/items', item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });
  
  // Update cart item
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });
  
  // Remove cart item
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest('DELETE', `/api/cart/items/${itemId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });
  
  // Add item to cart
  const addToCart = async (item: CartItemAdd) => {
    await addToCartMutation.mutateAsync(item);
  };
  
  // Update cart item
  const updateCartItem = async (itemId: number, quantity: number) => {
    await updateCartItemMutation.mutateAsync({ itemId, quantity });
  };
  
  // Remove cart item
  const removeCartItem = async (itemId: number) => {
    await removeCartItemMutation.mutateAsync(itemId);
  };
  
  // Clear cart (by deleting all items)
  const clearCart = async () => {
    if (cart && cart.items) {
      const deletePromises = cart.items.map(item => removeCartItem(item.id));
      await Promise.all(deletePromises);
    }
  };
  
  return (
    <CartContext.Provider value={{ 
      cart, 
      isLoading, 
      addToCart, 
      updateCartItem, 
      removeCartItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
