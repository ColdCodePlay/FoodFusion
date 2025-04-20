import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { CartWithItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type Address = {
  id: string;
  type: string;
  address: string;
  phone: string;
};

type PaymentMethod = {
  id: string;
  type: string;
  icon: string;
};

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cart, clearCart } = useCart();
  
  const [selectedAddress, setSelectedAddress] = useState<string>("address-1");
  const [selectedPayment, setSelectedPayment] = useState<string>("payment-1");
  
  const addresses: Address[] = [
    {
      id: "address-1",
      type: "Home",
      address: "123 Main Street, Apartment 4B, City, State, 12345",
      phone: "(123) 456-7890"
    },
    {
      id: "address-2",
      type: "Work",
      address: "456 Office Tower, Floor 7, Business District, City, State, 12345",
      phone: "(123) 456-7890"
    }
  ];
  
  const paymentMethods: PaymentMethod[] = [
    {
      id: "payment-1",
      type: "Credit/Debit Card",
      icon: "bank-card-line"
    },
    {
      id: "payment-2",
      type: "Digital Wallet",
      icon: "wallet-3-line"
    },
    {
      id: "payment-3",
      type: "Cash on Delivery",
      icon: "money-dollar-circle-line"
    }
  ];
  
  const { data: cartData } = useQuery<CartWithItems>({
    queryKey: ['/api/cart'],
  });
  
  const placeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      setLocation(`/order-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
          <Button onClick={() => setLocation('/')}>Browse Restaurants</Button>
        </div>
      </div>
    );
  }
  
  const selectedAddressDetails = addresses.find(addr => addr.id === selectedAddress);
  const selectedPaymentDetails = paymentMethods.find(pm => pm.id === selectedPayment);
  
  // Calculate order summary
  const subtotal = cartData.items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = cartData.restaurant.deliveryFee === 'Free' ? 0 : parseInt(cartData.restaurant.deliveryFee.replace('₹', ''));
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const taxes = Math.round(subtotal * 0.10); // 10% tax
  const total = subtotal + deliveryFee + serviceFee + taxes;
  
  const handlePlaceOrder = () => {
    if (!selectedAddressDetails) {
      toast({
        title: "Error",
        description: "Please select a delivery address",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedPaymentDetails) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }
    
    placeOrderMutation.mutate({
      restaurantId: cartData.restaurantId,
      total,
      deliveryAddress: selectedAddressDetails.address,
      paymentMethod: selectedPaymentDetails.type,
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Delivery Address */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Delivery Address</h3>
            
            <div className="space-y-4">
              {addresses.map(address => (
                <div key={address.id} className="flex items-center bg-white p-4 border rounded-lg">
                  <input 
                    type="radio" 
                    name="address" 
                    id={address.id} 
                    className="mr-3"
                    checked={selectedAddress === address.id}
                    onChange={() => setSelectedAddress(address.id)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{address.type}</h4>
                      <span className="text-sm text-primary">Edit</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                    <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                  </div>
                </div>
              ))}
              
              <button 
                type="button" 
                className="w-full py-3 border border-dashed border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Address
              </button>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            
            <div className="space-y-4">
              {paymentMethods.map(method => (
                <div key={method.id} className="flex items-center bg-white p-4 border rounded-lg">
                  <input 
                    type="radio" 
                    name="payment" 
                    id={method.id} 
                    className="mr-3"
                    checked={selectedPayment === method.id}
                    onChange={() => setSelectedPayment(method.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {method.icon === "bank-card-line" && (
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        )}
                        {method.icon === "wallet-3-line" && (
                          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
                        )}
                        {method.icon === "money-dollar-circle-line" && (
                          <circle cx="12" cy="12" r="10"></circle>
                        )}
                      </svg>
                      <h4 className="font-semibold">{method.type}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            
            <div className="bg-white p-4 border rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src={cartData.restaurant.image}
                  alt={cartData.restaurant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-2">
                  <h4 className="font-semibold">{cartData.restaurant.name}</h4>
                  <p className="text-xs text-gray-600">Delivery in {cartData.restaurant.deliveryTime}</p>
                </div>
              </div>
              
              <div className="space-y-3 border-b pb-4 mb-4">
                {cartData.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-semibold">{item.quantity} x {item.menuItem.name} {item.size !== 'regular' ? `(${item.size})` : ''}</p>
                      {item.extras && <p className="text-xs text-gray-600">{item.extras}</p>}
                    </div>
                    <span>₹{item.menuItem.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
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
                  <span>Service Fee</span>
                  <span>₹{serviceFee}</span>
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
            </div>
          </div>
          
          <Button 
            className="w-full py-6 bg-primary text-white rounded-md hover:bg-red-600 transition-colors"
            onClick={handlePlaceOrder}
            disabled={placeOrderMutation.isPending}
          >
            {placeOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
