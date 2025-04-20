import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import CartSidebar from "@/components/cart/cart-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, History, ShoppingBag } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();
  const { user, logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  
  // Calculate total items in cart
  const cartItemCount = cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                <path d="M7 11H17V13H7V11Z" fill="currentColor"/>
              </svg>
              <span className="ml-2 text-xl font-bold text-primary">FoodHub</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/" className={`px-3 py-2 ${location === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
              Home
            </Link>
            <Link href="/restaurants" className={`px-3 py-2 ${location === '/restaurants' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
              Restaurants
            </Link>
            <Link href="/offers" className={`px-3 py-2 ${location === '/offers' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
              Offers
            </Link>
            <Link href="/help" className={`px-3 py-2 ${location === '/help' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}>
              Help
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              type="button" 
              className="relative p-2 text-gray-600 hover:text-primary transition-colors"
              onClick={() => setIsCartOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hidden md:flex">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <History className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="hidden md:block"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
            
            <button 
              type="button" 
              className="md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isMobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12"></path>
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18"></path>
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 py-3 bg-white border-t">
            <Link href="/" className="block py-2 text-gray-600">Home</Link>
            <Link href="/restaurants" className="block py-2 text-gray-600">Restaurants</Link>
            <Link href="/offers" className="block py-2 text-gray-600">Offers</Link>
            <Link href="/help" className="block py-2 text-gray-600">Help</Link>
            
            {user ? (
              <>
                <div className="pt-2 pb-1 border-t mt-2">
                  <div className="flex items-center py-2">
                    <Avatar className="h-9 w-9 mr-2">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" className="flex items-center py-2 text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link href="/orders" className="flex items-center py-2 text-gray-600">
                    <History className="mr-2 h-4 w-4" />
                    <span>Order History</span>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="mt-2 w-full flex items-center justify-center" 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                variant="outline" 
                className="mt-2 w-full"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
        )}
      </header>
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
