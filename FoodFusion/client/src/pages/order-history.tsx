import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { CalendarIcon, CheckCircle, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { format } from "date-fns";

type Order = {
  id: number;
  restaurantId: number;
  userId: string;
  createdAt: string;
  status: string;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  orderId: string;
  restaurant: {
    id: number;
    name: string;
    image: string;
    cuisines: string;
  };
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  const { data: orders, isLoading, error } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-6">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-red-500 mb-4">Failed to load order history</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-500">Delivered</Badge>;
      case "in_transit":
        return <Badge className="bg-blue-500">In Transit</Badge>;
      case "preparing":
        return <Badge className="bg-yellow-500">Preparing</Badge>;
      case "received":
        return <Badge className="bg-purple-500">Received</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      {orders && orders.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="flex flex-col items-center gap-4">
            <UtensilsCrossed className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No orders yet</h2>
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <Button onClick={() => navigate("/")}>Browse Restaurants</Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {orders?.map((order) => (
            <Card key={order.id} className="mb-6 overflow-hidden">
              <CardHeader className="pb-4 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{order.orderId}</CardTitle>
                  <CardDescription>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(order.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
                    </span>
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={order.restaurant.image} 
                    alt={order.restaurant.name} 
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{order.restaurant.name}</h3>
                    <p className="text-sm text-muted-foreground">{order.restaurant.cuisines}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                  >
                    Track Order
                  </Button>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {order.deliveryAddress.substring(0, 50)}
                    {order.deliveryAddress.length > 50 ? "..." : ""}
                  </div>
                  <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4">
                <div className="w-full flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}