import { Link } from "wouter";
import { Restaurant } from "@shared/schema";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  // Convert rating to color class
  const getRatingColorClass = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 4.0) return "bg-green-500";
    if (rating >= 3.5) return "bg-yellow-500";
    return "bg-yellow-600";
  };

  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <div className="restaurant-card bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
        <div className="relative">
          <img 
            src={restaurant.image} 
            alt={restaurant.name} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-md text-sm font-semibold">
            <span className="text-primary">{restaurant.deliveryTime}</span>
          </div>
          {restaurant.promoted && (
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center">
                <span className="bg-green-500 text-white text-sm px-2 py-1 rounded">Promoted</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg">{restaurant.name}</h3>
            <div className={`flex items-center px-2 py-1 ${getRatingColorClass(restaurant.rating)} text-white rounded`}>
              <span className="text-sm font-semibold mr-1">{restaurant.rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap items-center text-sm text-gray-600 mt-1">
            <span>{restaurant.cuisines}</span>
            <span className="mx-2">•</span>
            <span>{restaurant.priceRange}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{restaurant.distance}</span>
            <span className="mx-2">•</span>
            <span>{restaurant.deliveryFee} delivery fee</span>
          </div>
          {restaurant.offer && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center text-sm text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>{restaurant.offer}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
