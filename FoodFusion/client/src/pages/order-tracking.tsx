import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { ArrowLeft, Check, ChevronRight, Clock, MapPin, TruckIcon } from "lucide-react";
import { format } from "date-fns";

type Order = {
  id: number;
  createdAt: string;
  restaurant: {
    id: number;
    name: string;
    image: string;
  };
  orderId: string;
  deliveryAddress: string;
  total: number;
  tracking: {
    status: string;
    updatedAt: string;
    estimatedDeliveryTime: string;
  };
};

export default function OrderTracking() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const orderId = Number(params.id);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user && !!orderId,
    refetchInterval: 30000, // Refetch every 30 seconds to get status updates
  });

  // Get tracking step from status
  const getTrackingStep = (status: string): number => {
    switch (status) {
      case "Order Received":
        return 1;
      case "Preparing Your Food":
        return 2;
      case "Out for Delivery":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <Skeleton className="h-4 w-full mb-8" />
              <div className="flex justify-between mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-12 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="border-t pt-6">
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
        </Button>
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-red-500 mb-4">Failed to load order tracking information</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const trackingStep = getTrackingStep(order.tracking.status);

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/orders")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Order Tracking</span>
            <span className="text-base font-medium">{order.orderId}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Order placed on {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
          </p>
        </CardHeader>
        <CardContent>
          {/* Tracking Steps */}
          <div className="mb-8">
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-1 bg-muted"></div>
              <div 
                className="absolute top-1/2 left-0 transform -translate-y-1/2 h-1 bg-primary transition-all duration-500" 
                style={{ width: `${(trackingStep - 1) * 33.3}%` }}
              ></div>
              <div className="relative flex justify-between">
                {/* Order Received */}
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 
                    ${trackingStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-background border border-muted'}`}>
                    {trackingStep > 1 ? <Check className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-2 text-center">Order<br/>Received</span>
                </div>

                {/* Preparing Food */}
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 
                    ${trackingStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-background border border-muted'}`}>
                    {trackingStep > 2 ? <Check className="h-5 w-5" /> : <TruckIcon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-2 text-center">Preparing<br/>Food</span>
                </div>

                {/* Out for Delivery */}
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 
                    ${trackingStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-background border border-muted'}`}>
                    {trackingStep > 3 ? <Check className="h-5 w-5" /> : <TruckIcon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-2 text-center">Out for<br/>Delivery</span>
                </div>

                {/* Delivered */}
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 
                    ${trackingStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-background border border-muted'}`}>
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-2 text-center">Delivered</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm font-medium">Current Status: <span className="text-primary font-semibold">{order.tracking.status}</span></p>
              <p className="text-xs text-muted-foreground">
                {trackingStep < 4 ? (
                  <>Estimated delivery by {format(new Date(order.tracking.estimatedDeliveryTime), "hh:mm a")}</>
                ) : (
                  <>Delivered at {format(new Date(order.tracking.updatedAt), "hh:mm a")}</>
                )}
              </p>
            </div>
          </div>

          {/* Order and Delivery Details */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={order.restaurant.image} 
                alt={order.restaurant.name} 
                className="h-16 w-16 object-cover rounded-md"
              />
              <div>
                <h3 className="font-semibold">{order.restaurant.name}</h3>
                <p className="text-sm text-muted-foreground">Order Total: ₹{order.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Delivery Address: {order.deliveryAddress}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              onClick={() => navigate(`/order-confirmation/${order.id}`)}
              className="w-full max-w-xs"
            >
              View Order Details <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}