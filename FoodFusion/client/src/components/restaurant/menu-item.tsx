import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface MenuItemProps {
  menuItem: MenuItem;
  onSelect: () => void;
}

export default function MenuItemComponent({ menuItem, onSelect }: MenuItemProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal
    
    try {
      await addToCart({
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        quantity: 1,
        size: 'half',
        extras: '',
        instructions: ''
      });
      
      toast({
        title: "Added to cart",
        description: `${menuItem.name} added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className="menu-item bg-white rounded-lg shadow-sm p-4 flex justify-between items-center hover:shadow-md transition-all duration-200 cursor-pointer" 
      onClick={onSelect}
    >
      <div className="flex-1">
        <div className="flex items-center">
          <div className="w-5 h-5 border border-gray-300 rounded-sm mr-2 flex items-center justify-center text-green-500">
            {menuItem.isVeg ? (
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                <circle cx="12" cy="12" r="8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="#CB202D">
                <circle cx="12" cy="12" r="8" />
              </svg>
            )}
          </div>
          <h5 className="font-semibold flex items-center">
            {menuItem.name}
            {menuItem.isBestseller && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary text-white rounded">Bestseller</span>
            )}
          </h5>
        </div>
        <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
        <div className="mt-2 flex items-center">
          <span className="font-semibold">₹{menuItem.price}</span>
          <div className="ml-4 flex items-center text-sm">
            <div className="flex items-center text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
              <span>{menuItem.rating}</span>
            </div>
            <span className="mx-2 text-gray-300">|</span>
            <span className="text-gray-600">{menuItem.numRatings}+ orders</span>
          </div>
        </div>
      </div>
      <div className="ml-4 flex flex-col items-end">
        <img 
          src={menuItem.image} 
          alt={menuItem.name} 
          className="w-24 h-24 object-cover rounded-lg"
        />
        <Button 
          variant="outline" 
          className="mt-2 px-3 py-1 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
          onClick={handleAddToCart}
        >
          Add +
        </Button>
      </div>
    </div>
  );
}
