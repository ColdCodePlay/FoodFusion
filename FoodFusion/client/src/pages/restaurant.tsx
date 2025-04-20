import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { MenuCategory, MenuItem, Restaurant } from "@shared/schema";
import { useState, useRef, useEffect } from "react";
import MenuItemComponent from "@/components/restaurant/menu-item";
import FoodItemModal from "@/components/ui/food-item-modal";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantPage() {
  const [, setLocation] = useLocation();
  const { id: restaurantId } = useParams();
  const numId = parseInt(restaurantId);
  
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const menuSectionRef = useRef<HTMLDivElement>(null);
  
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${numId}`],
    enabled: !isNaN(numId)
  });
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<MenuCategory[]>({
    queryKey: [`/api/restaurants/${numId}/categories`],
    enabled: !isNaN(numId)
  });
  
  const { data: menuItems = [], isLoading: isLoadingMenuItems } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${numId}/menu`],
    enabled: !isNaN(numId)
  });

  const { cart } = useCart();
  
  // Set the active category to the first one when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);
  
  if (isNaN(numId)) {
    return <div className="container mx-auto px-4 py-8">Invalid restaurant ID</div>;
  }
  
  if (isLoadingRestaurant || isLoadingCategories || isLoadingMenuItems) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <div className="flex space-x-4 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-24 w-24 mx-auto text-gray-400 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
        <p className="text-gray-600 mb-6">This restaurant may have been removed or you might have followed an invalid link.</p>
        <Button onClick={() => setLocation('/')}>Back to Home</Button>
      </div>
    );
  }
  
  // Filter menu items by category
  const filteredMenuItems = activeCategory 
    ? menuItems.filter(item => {
        const category = categories.find(cat => cat.id === item.categoryId);
        return category && category.name === activeCategory;
      })
    : [];
  
  // Scroll to menu section
  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Check if this restaurant is in the cart
  const isInCart = cart?.restaurantId === numId && cart?.items?.length > 0;
  // Count cart items
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div>
      {/* Restaurant Hero */}
      <div className="restaurant-hero relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-6">
          <div className="container mx-auto">
            <div className="flex items-center">
              {restaurant.promoted && (
                <span className="bg-primary text-white text-sm px-2 py-1 rounded mr-2">Promoted</span>
              )}
              <span className="bg-green-500 text-white text-sm px-2 py-1 rounded">Open Now</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Restaurant Info */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center text-sm text-gray-600 mt-2">
              <span>{restaurant.cuisines}</span>
              <span className="mx-2">•</span>
              <span>{restaurant.priceRange}</span>
              <span className="mx-2">•</span>
              <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center mt-2">
              <div className={`flex items-center px-2 py-1 ${restaurant.rating >= 4 ? 'bg-green-500' : 'bg-yellow-500'} text-white rounded`}>
                <span className="text-sm font-semibold mr-1">{restaurant.rating}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                </svg>
              </div>
              <span className="ml-2 text-sm text-gray-600">200+ ratings</span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <Button variant="outline" className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span>Share</span>
              </Button>
              <Button variant="outline" className="flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>Favorite</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Restaurant Offers */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center text-sm text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{restaurant.offer}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Delivery in {restaurant.deliveryTime}</span>
          </div>
        </div>
        
        {/* Menu */}
        <div className="mt-8" ref={menuSectionRef}>
          <h3 className="text-xl font-bold mb-4">Menu</h3>
          
          {/* Menu Categories */}
          <div className="sticky top-16 z-10 bg-white py-3 border-b overflow-x-auto">
            <div className="flex space-x-6">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  className={`whitespace-nowrap ${activeCategory === category.name 
                    ? 'text-primary border-b-2 border-primary font-semibold' 
                    : 'text-gray-600 hover:text-primary'}`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-4">{activeCategory}</h4>
            
            <div className="space-y-4">
              {filteredMenuItems.map(menuItem => (
                <MenuItemComponent 
                  key={menuItem.id} 
                  menuItem={menuItem} 
                  onSelect={() => setSelectedMenuItem(menuItem)}
                />
              ))}
              
              {filteredMenuItems.length === 0 && (
                <p className="text-gray-500 text-center py-4">No items found in this category</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Food Item Modal */}
      <FoodItemModal 
        isOpen={!!selectedMenuItem} 
        menuItem={selectedMenuItem} 
        onClose={() => setSelectedMenuItem(null)} 
      />
      
      {/* Bottom bar if items in cart */}
      {isInCart && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <span className="font-semibold">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart</span>
            </div>
            <Button 
              onClick={() => setLocation('/checkout')}
              className="bg-white text-primary hover:bg-gray-100"
            >
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
