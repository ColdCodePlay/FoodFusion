import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function OrderConfirmation() {
  const { id: orderId } = useParams();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If there's no order ID, redirect to home
    if (!orderId) {
      setLocation('/');
    }
  }, [orderId, setLocation]);

  // This would normally fetch order details from the API
  // For simplicity, we're using hardcoded data here
  const orderDetails = {
    orderId: `ORD${String(orderId).padStart(8, '0')}`,
    restaurant: "Spice Junction",
    total: "₹600",
    paymentMethod: "Credit Card",
    deliveryAddress: "123 Main Street, Apartment 4B, City"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-6">Your order has been placed successfully and will be delivered in 15-25 minutes.</p>
        
        <div className="bg-white p-6 border rounded-lg mb-6">
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Order ID</span>
            <span>{orderDetails.orderId}</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Restaurant</span>
            <span>{orderDetails.restaurant}</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Order Amount</span>
            <span>{orderDetails.total}</span>
          </div>
          
          <div className="flex justify-between mb-4">
            <span className="font-semibold">Payment Method</span>
            <span>{orderDetails.paymentMethod}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="font-semibold">Delivery Address</span>
            <span className="text-right text-sm">{orderDetails.deliveryAddress}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button className="w-full py-3 bg-primary text-white rounded-md hover:bg-red-600 transition-colors">
            Track Order
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full py-3 border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
