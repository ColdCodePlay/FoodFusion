import { useState, useRef, useEffect } from "react";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  ratingFilter: number | null;
  onRatingFilterChange: (rating: number | null) => void;
}

export default function FilterBar({ 
  activeFilter,
  onFilterChange,
  ratingFilter,
  onRatingFilterChange
}: FilterBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  
  // Close filters dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="sticky top-16 z-40 bg-white shadow-sm py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between overflow-x-auto pb-2 md:pb-0">
          <div className="flex space-x-4">
            <button 
              type="button" 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeFilter === "All" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-colors`}
              onClick={() => onFilterChange("All")}
            >
              <span>All</span>
            </button>
            <button 
              type="button" 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeFilter === "Delivery" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-colors`}
              onClick={() => onFilterChange("Delivery")}
            >
              <span>Delivery</span>
            </button>
            <button 
              type="button" 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeFilter === "Takeaway" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-colors`}
              onClick={() => onFilterChange("Takeaway")}
            >
              <span>Takeaway</span>
            </button>
            <button 
              type="button" 
              className={`whitespace-nowrap px-4 py-2 rounded-full ${
                activeFilter === "Dining" 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } transition-colors`}
              onClick={() => onFilterChange("Dining")}
            >
              <span>Dining</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <div className="relative" ref={filtersRef}>
              <button 
                type="button" 
                className="px-3 py-2 flex items-center border rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="21" y1="6" x2="3" y2="6"></line>
                  <line x1="17" y1="12" x2="3" y2="12"></line>
                  <line x1="13" y1="18" x2="3" y2="18"></line>
                </svg>
                <span>Filters</span>
              </button>
              
              {isFiltersOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Cuisine</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Indian</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Chinese</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Italian</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Mexican</span>
                      </label>
                    </div>
                    
                    <h3 className="font-semibold mt-4 mb-2">Price Range</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>$</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>$$</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>$$$</span>
                      </label>
                    </div>
                    
                    <div className="flex mt-4 pt-2 border-t">
                      <button 
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-md mr-2 hover:bg-gray-200"
                        onClick={() => {
                          onRatingFilterChange(null);
                          setIsFiltersOpen(false);
                        }}
                      >
                        Clear
                      </button>
                      <button 
                        className="flex-1 px-3 py-2 bg-primary text-white rounded-md"
                        onClick={() => setIsFiltersOpen(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="button" 
              className={`px-3 py-2 flex items-center border rounded-md ${
                ratingFilter ? 'bg-primary text-white' : 'hover:bg-gray-100'
              } transition-colors`}
              onClick={() => onRatingFilterChange(ratingFilter ? null : 4.0)}
            >
              <span>Rating: {ratingFilter ? `${ratingFilter}+` : '4.0+'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
