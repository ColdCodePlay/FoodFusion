import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface FoodItemModalProps {
  isOpen: boolean;
  menuItem: MenuItem | null;
  onClose: () => void;
}

export default function FoodItemModal({ isOpen, menuItem, onClose }: FoodItemModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [size, setSize] = useState("Half");
  const [quantity, setQuantity] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  
  if (!menuItem) return null;
  
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(e.target.value);
  };
  
  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (e.target.checked) {
      setExtras([...extras, value]);
    } else {
      setExtras(extras.filter(item => item !== value));
    }
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = async () => {
    try {
      await addToCart({
        menuItemId: menuItem.id,
        restaurantId: menuItem.restaurantId,
        quantity,
        size: size.toLowerCase(),
        extras: extras.join(", "),
        instructions
      });
      
      toast({
        title: "Added to cart",
        description: `${quantity} × ${menuItem.name} added to your cart`,
      });
      
      onClose();
      // Reset form state
      setSize("Half");
      setQuantity(1);
      setExtras([]);
      setInstructions("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Calculate price based on size
  const basePrice = menuItem.price;
  const sizeMultiplier = size === "Full" ? 1.7 : 1;
  const extrasPrice = extras.length * 30; // Each extra costs ₹30
  const totalPrice = Math.round((basePrice * sizeMultiplier) + extrasPrice) * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0">
        <div className="relative">
          <img 
            src={menuItem.image} 
            alt={menuItem.name} 
            className="w-full h-56 object-cover"
          />
          {menuItem.isBestseller && (
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-white text-sm px-2 py-1 rounded">Bestseller</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{menuItem.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
            </div>
            <div className="flex items-center px-2 py-1 bg-green-500 text-white rounded">
              <span className="text-sm font-semibold mr-1">{menuItem.rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
              </svg>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-xl font-semibold">₹{basePrice}</span>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Select Size</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="size-half" 
                  name="size" 
                  value="Half" 
                  className="mr-2" 
                  checked={size === "Half"}
                  onChange={handleSizeChange}
                />
                <label htmlFor="size-half" className="flex-1">Half</label>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="size-full" 
                  name="size" 
                  value="Full" 
                  className="mr-2"
                  checked={size === "Full"}
                  onChange={handleSizeChange}
                />
                <label htmlFor="size-full" className="flex-1">Full</label>
                <span>₹{Math.round(basePrice * 1.7)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Add Extra</h4>
            <div className="space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="extra-cheese" 
                  value="Extra Cheese"
                  className="mr-2"
                  checked={extras.includes("Extra Cheese")}
                  onChange={handleExtraChange}
                />
                <label htmlFor="extra-cheese" className="flex-1">Extra Cheese</label>
                <span>+ ₹30</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="extra-sauce" 
                  value="Extra Sauce"
                  className="mr-2"
                  checked={extras.includes("Extra Sauce")}
                  onChange={handleExtraChange}
                />
                <label htmlFor="extra-sauce" className="flex-1">Extra Sauce</label>
                <span>+ ₹30</span>
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="extra-butter" 
                  value="Extra Butter"
                  className="mr-2"
                  checked={extras.includes("Extra Butter")}
                  onChange={handleExtraChange}
                />
                <label htmlFor="extra-butter" className="flex-1">Extra Butter</label>
                <span>+ ₹30</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Special Instructions</h4>
            <textarea 
              placeholder="Add your instructions here..." 
              className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary" 
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            ></textarea>
          </div>
          
          <div className="mt-6 flex items-center">
            <div className="flex items-center border rounded-md">
              <button 
                type="button" 
                className="px-3 py-1 text-gray-600"
                onClick={handleDecreaseQuantity}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button 
                type="button" 
                className="px-3 py-1 text-gray-600"
                onClick={handleIncreaseQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <Button 
              className="ml-4 flex-1 py-3 bg-primary text-white rounded-md hover:bg-red-600 transition-colors"
              onClick={handleAddToCart}
            >
              Add to Cart - ₹{totalPrice}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
