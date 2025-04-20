import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartWithItems } from "@shared/schema";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updateCartItem, removeCartItem } = useCart();
  
  const { data: cart, isLoading, refetch } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
  });
  
  // Refetch cart when sidebar is opened
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);
  
  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeCartItem(itemId);
      } else {
        await updateCartItem(itemId, quantity);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCheckout = () => {
    onClose();
    setLocation('/checkout');
  };
  
  const handleApplyCoupon = () => {
    toast({
      title: "Coupon",
      description: "Feature coming soon!",
    });
  };
  
  // Calculate cart totals
  const subtotal = cart?.items?.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0) || 0;
  const deliveryFee = cart?.restaurant ? (cart.restaurant.deliveryFee === 'Free' ? 0 : parseInt(cart.restaurant.deliveryFee.replace('₹', ''))) : 0;
  const taxes = Math.round(subtotal * 0.10); // 10% tax
  const total = subtotal + deliveryFee + taxes;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full md:max-w-md p-0 flex flex-col h-full" side="right">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-xl font-bold">Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-center mb-4">Add items from a restaurant to get started</p>
              <Button variant="outline" onClick={() => setLocation('/')}>Browse Restaurants</Button>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <img 
                    src={cart.restaurant.image} 
                    alt={cart.restaurant.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-2">
                    <h4 className="font-semibold">{cart.restaurant.name}</h4>
                    <p className="text-xs text-gray-600">Delivery in {cart.restaurant.deliveryTime}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center border-b pb-4">
                    <div className="w-5 h-5 border border-gray-300 rounded-sm mr-2 flex items-center justify-center text-green-500">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                        <circle cx="12" cy="12" r="8" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h5 className="font-semibold">{item.menuItem.name}</h5>
                        <div className="flex items-center">
                          <button 
                            type="button" 
                            className="text-gray-400 hover:text-gray-600"
                            onClick={() => removeCartItem(item.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {item.size !== 'regular' && item.size.charAt(0).toUpperCase() + item.size.slice(1)}
                        {item.extras && ` • ${item.extras}`}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <button 
                            type="button" 
                            className="px-2 py-0.5 text-gray-600"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-sm">{item.quantity}</span>
                          <button 
                            type="button" 
                            className="px-2 py-0.5 text-gray-600"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold">₹{item.menuItem.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button 
                  type="button" 
                  className="w-full py-3 border border-dashed border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
                  onClick={handleApplyCoupon}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  Apply Coupon
                </button>
              </div>
            </>
          )}
        </div>
        
        {cart && cart.items && cart.items.length > 0 && (
          <div className="p-4 bg-gray-100">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Item Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxes</span>
                <span>₹{taxes}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-300 pt-2 mt-2">
                <span>To Pay</span>
                <span>₹{total}</span>
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full py-3 bg-primary text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
