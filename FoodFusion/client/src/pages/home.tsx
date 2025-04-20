import { useQuery } from "@tanstack/react-query";
import { Restaurant } from "@shared/schema";
import RestaurantCard from "@/components/restaurant/restaurant-card";
import FilterBar from "@/components/restaurant/filter-bar";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);
  
  const { data: restaurants = [], isLoading, error } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
  });
  
  // Filter restaurants based on search, type and rating
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search filter
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          restaurant.cuisines.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Rating filter
    const matchesRating = ratingFilter ? restaurant.rating >= ratingFilter : true;
    
    // For simplicity, we'll consider filterType as "All" since we don't have a type field
    // In a real app, you would filter by restaurant.type if available
    const matchesType = filterType === "All" ? true : true;
    
    return matchesSearch && matchesRating && matchesType;
  });

  // Get the number of restaurants to display
  const displayedRestaurants = filteredRestaurants.slice(0, visibleCount);
  
  // Handle load more
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 3);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-primary py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-6">Order food from the best restaurants</h1>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for restaurants, cuisines or dishes..." 
                className="w-full py-4 px-6 rounded-lg text-neutral-800 outline-none transition-all duration-300 focus:ring-2 focus:ring-opacity-50 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-md"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Filter Bar */}
      <FilterBar 
        activeFilter={filterType} 
        onFilterChange={setFilterType}
        ratingFilter={ratingFilter}
        onRatingFilterChange={setRatingFilter}
      />
      
      {/* Restaurant Listing */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Restaurants Near You</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md p-4 h-[300px] animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-500">Error loading restaurants. Please try again later.</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No restaurants found matching your search criteria.</p>
              {searchQuery && (
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
          
          {filteredRestaurants.length > visibleCount && (
            <div className="mt-8 text-center">
              <Button 
                variant="outline" 
                className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={handleLoadMore}
              >
                Load More Restaurants
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
