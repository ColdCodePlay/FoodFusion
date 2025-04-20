import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCartItemSchema, insertCartSchema, insertOrderSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup authentication
  setupAuth(app);

  // Initialize with mock data
  await initializeData();

  // Restaurant routes
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const restaurants = await storage.getRestaurants();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await storage.getRestaurantById(id);
      
      if (!restaurant) {
        return res.status(404).json({ error: "Restaurant not found" });
      }
      
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch restaurant" });
    }
  });

  // Menu Categories routes
  app.get("/api/restaurants/:id/categories", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const categories = await storage.getMenuCategoriesByRestaurantId(restaurantId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu categories" });
    }
  });

  // Menu Items routes
  app.get("/api/restaurants/:id/menu", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const menuItems = await storage.getMenuItemsByRestaurantId(restaurantId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.getMenuItemById(id);
      
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu item" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req: Request, res: Response) => {
    try {
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      const cart = await storage.getCartByUserId(userId);
      res.json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      
      // Check if cart already exists for this user, and delete it if different restaurant
      const existingCart = await storage.getCartByUserId(userId);
      if (existingCart && existingCart.restaurantId !== req.body.restaurantId) {
        await storage.deleteCartByUserId(userId);
      }
      
      // Validate request data
      const validatedData = insertCartSchema.parse({
        ...req.body,
        userId
      });
      
      // Create new cart or use existing
      let cart = existingCart;
      if (!cart) {
        cart = await storage.createCart(validatedData);
      }
      
      res.status(201).json(cart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create cart" });
    }
  });

  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      
      // Get user's cart
      let cart = await storage.getCartByUserId(userId);
      
      // If no cart exists, create one
      if (!cart) {
        const restaurant = await storage.getRestaurantById(req.body.restaurantId);
        if (!restaurant) {
          return res.status(404).json({ error: "Restaurant not found" });
        }
        
        const newCart = await storage.createCart({
          userId,
          restaurantId: restaurant.id
        });
        
        cart = {
          ...newCart,
          items: [],
          restaurant
        };
      }
      
      // Validate request data
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      // Add item to cart
      const cartItem = await storage.addItemToCart(validatedData);
      
      // Get updated cart
      const updatedCart = await storage.getCartByUserId(userId);
      
      res.status(201).json(updatedCart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (quantity < 1) {
        await storage.removeCartItem(id);
      } else {
        await storage.updateCartItemQuantity(id, quantity);
      }
      
      // Get updated cart
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      const updatedCart = await storage.getCartByUserId(userId);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeCartItem(id);
      
      // Get updated cart
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      const updatedCart = await storage.getCartByUserId(userId);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      // Use authenticated user ID if available, otherwise use guest
      const userId = req.isAuthenticated() ? req.user.id.toString() : "guest";
      
      // Get user's cart
      const cart = await storage.getCartByUserId(userId);
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Validate request data
      const validatedData = insertOrderSchema.parse({
        ...req.body,
        userId,
        restaurantId: cart.restaurantId
      });
      
      // Create order items from cart items
      const orderItems = cart.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.menuItem.name,
        price: item.menuItem.price,
        quantity: item.quantity,
        size: item.size,
        extras: item.extras
      }));
      
      // Create order
      const order = await storage.createOrder(validatedData, orderItems);
      
      // Clear cart after order is placed
      await storage.deleteCartByUserId(userId);
      
      res.status(201).json({ 
        ...order,
        orderId: `ORD${String(order.id).padStart(8, '0')}`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Order history routes
  app.get("/api/orders", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view order history" });
      }
      
      const userId = req.user.id.toString();
      const orders = await storage.getOrdersByUserId(userId);
      
      // Add restaurants to orders
      const ordersWithRestaurants = await Promise.all(
        orders.map(async (order) => {
          const restaurant = await storage.getRestaurantById(order.restaurantId);
          return {
            ...order,
            restaurant,
            orderId: `ORD${String(order.id).padStart(8, '0')}`
          };
        })
      );
      
      res.json(ordersWithRestaurants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Get a specific order with tracking details
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "You must be logged in to view order details" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Check if the order belongs to the authenticated user
      if (order.userId !== req.user.id.toString()) {
        return res.status(403).json({ error: "You don't have permission to view this order" });
      }
      
      // Get restaurant details
      const restaurant = await storage.getRestaurantById(order.restaurantId);
      
      // Simulate order tracking status based on order creation time
      const orderCreationTime = order.createdAt.getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - orderCreationTime;
      
      // Track order status (for demo purposes)
      let trackingStatus;
      if (timeDiff < 5 * 60 * 1000) { // Less than 5 minutes
        trackingStatus = "Order Received";
      } else if (timeDiff < 15 * 60 * 1000) { // Less than 15 minutes
        trackingStatus = "Preparing Your Food";
      } else if (timeDiff < 30 * 60 * 1000) { // Less than 30 minutes
        trackingStatus = "Out for Delivery";
      } else {
        trackingStatus = "Delivered";
      }
      
      res.json({
        ...order,
        restaurant,
        tracking: {
          status: trackingStatus,
          updatedAt: new Date(),
          estimatedDeliveryTime: new Date(orderCreationTime + 45 * 60 * 1000) // 45 minutes after order was placed
        },
        orderId: `ORD${String(order.id).padStart(8, '0')}`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  return httpServer;
}

// Initialize with mock data
async function initializeData() {
  // If no restaurants exist, initialize with mock data
  const restaurants = await storage.getRestaurants();
  if (restaurants.length === 0) {
    // Add restaurants
    const gourmetKitchen = await storage.createRestaurant({
      name: "The Gourmet Kitchen",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      cuisines: "Italian, Continental",
      rating: 4.5,
      deliveryTime: "30-40 min",
      priceRange: "$$$",
      distance: "2.1 km away",
      deliveryFee: "₹30",
      promoted: true,
      offer: "50% off up to ₹100"
    });

    const spiceJunction = await storage.createRestaurant({
      name: "Spice Junction",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
      cuisines: "Indian, North Indian",
      rating: 4.2,
      deliveryTime: "15-25 min",
      priceRange: "$$",
      distance: "1.3 km away",
      deliveryFee: "₹20",
      promoted: false,
      offer: "Free delivery on orders above ₹199"
    });

    const goldenDragon = await storage.createRestaurant({
      name: "Golden Dragon",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
      cuisines: "Chinese, Thai",
      rating: 4.7,
      deliveryTime: "40-50 min",
      priceRange: "$$$",
      distance: "3.5 km away",
      deliveryFee: "₹40",
      promoted: false,
      offer: "₹100 off on orders above ₹499"
    });

    const urbanCafe = await storage.createRestaurant({
      name: "Urban Cafe",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c",
      cuisines: "Cafe, Beverages",
      rating: 3.9,
      deliveryTime: "25-35 min",
      priceRange: "$$",
      distance: "1.8 km away",
      deliveryFee: "₹25",
      promoted: false,
      offer: "Buy 1 Get 1 on all beverages"
    });

    const pizzaParadise = await storage.createRestaurant({
      name: "Pizza Paradise",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543",
      cuisines: "Pizza, Italian",
      rating: 4.3,
      deliveryTime: "20-30 min",
      priceRange: "$$",
      distance: "2.3 km away",
      deliveryFee: "₹35",
      promoted: false,
      offer: "Flat 20% off on all orders"
    });

    const burgerBliss = await storage.createRestaurant({
      name: "Burger Bliss",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641",
      cuisines: "Burgers, Fast Food",
      rating: 4.4,
      deliveryTime: "35-45 min",
      priceRange: "$$",
      distance: "2.7 km away",
      deliveryFee: "₹30",
      promoted: true,
      offer: "Free fries on orders above ₹299"
    });

    // Add categories for each restaurant
    
    // Categories for The Gourmet Kitchen
    const gourmetKitchenCategories = [
      await storage.createMenuCategory({ restaurantId: gourmetKitchen.id, name: "Recommended" }),
      await storage.createMenuCategory({ restaurantId: gourmetKitchen.id, name: "Appetizers" }),
      await storage.createMenuCategory({ restaurantId: gourmetKitchen.id, name: "Pastas" }),
      await storage.createMenuCategory({ restaurantId: gourmetKitchen.id, name: "Mains" }),
      await storage.createMenuCategory({ restaurantId: gourmetKitchen.id, name: "Desserts" })
    ];
    
    // Categories for Spice Junction
    const spiceJunctionCategories = [
      await storage.createMenuCategory({ restaurantId: spiceJunction.id, name: "Recommended" }),
      await storage.createMenuCategory({ restaurantId: spiceJunction.id, name: "Starters" }),
      await storage.createMenuCategory({ restaurantId: spiceJunction.id, name: "Main Course" }),
      await storage.createMenuCategory({ restaurantId: spiceJunction.id, name: "Beverages" }),
      await storage.createMenuCategory({ restaurantId: spiceJunction.id, name: "Desserts" })
    ];
    
    // Categories for Golden Dragon
    const goldenDragonCategories = [
      await storage.createMenuCategory({ restaurantId: goldenDragon.id, name: "Recommended" }),
      await storage.createMenuCategory({ restaurantId: goldenDragon.id, name: "Appetizers" }),
      await storage.createMenuCategory({ restaurantId: goldenDragon.id, name: "Soups" }),
      await storage.createMenuCategory({ restaurantId: goldenDragon.id, name: "Main Course" }),
      await storage.createMenuCategory({ restaurantId: goldenDragon.id, name: "Noodles & Rice" })
    ];
    
    // Categories for Urban Cafe
    const urbanCafeCategories = [
      await storage.createMenuCategory({ restaurantId: urbanCafe.id, name: "Recommended" }),
      await storage.createMenuCategory({ restaurantId: urbanCafe.id, name: "Coffee" }),
      await storage.createMenuCategory({ restaurantId: urbanCafe.id, name: "Snacks" }),
      await storage.createMenuCategory({ restaurantId: urbanCafe.id, name: "Sandwiches" }),
      await storage.createMenuCategory({ restaurantId: urbanCafe.id, name: "Desserts" })
    ];

    // Add menu items for The Gourmet Kitchen
    await storage.createMenuItem({
      restaurantId: gourmetKitchen.id,
      categoryId: gourmetKitchenCategories[0].id, // Recommended
      name: "Truffle Risotto",
      description: "Creamy Arborio rice with wild mushrooms and truffle oil",
      price: 449,
      image: "https://images.unsplash.com/photo-1633964913295-ceb43956a0c7",
      rating: 4.8,
      numRatings: 120,
      isVeg: true,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: gourmetKitchen.id,
      categoryId: gourmetKitchenCategories[0].id, // Recommended
      name: "Lobster Ravioli",
      description: "Homemade ravioli filled with fresh lobster in a creamy sauce",
      price: 599,
      image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b",
      rating: 4.9,
      numRatings: 85,
      isVeg: false,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: gourmetKitchen.id,
      categoryId: gourmetKitchenCategories[1].id, // Appetizers
      name: "Bruschetta",
      description: "Toasted bread topped with fresh tomatoes, basil and olive oil",
      price: 249,
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f",
      rating: 4.5,
      numRatings: 65,
      isVeg: true,
      isBestseller: false
    });

    await storage.createMenuItem({
      restaurantId: gourmetKitchen.id,
      categoryId: gourmetKitchenCategories[2].id, // Pastas
      name: "Spaghetti Carbonara",
      description: "Classic pasta with eggs, cheese, pancetta and black pepper",
      price: 399,
      image: "https://images.unsplash.com/photo-1588013273468-315fd88ea34c",
      rating: 4.7,
      numRatings: 90,
      isVeg: false,
      isBestseller: false
    });

    // Menu items for Spice Junction
    await storage.createMenuItem({
      restaurantId: spiceJunction.id,
      categoryId: spiceJunctionCategories[0].id, // Recommended
      name: "Butter Chicken",
      description: "Tender chicken in a creamy tomato sauce",
      price: 299,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
      rating: 4.5,
      numRatings: 100,
      isVeg: false,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: spiceJunction.id,
      categoryId: spiceJunctionCategories[0].id, // Recommended
      name: "Paneer Tikka",
      description: "Grilled cottage cheese with spices",
      price: 249,
      image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0",
      rating: 4.3,
      numRatings: 80,
      isVeg: true,
      isBestseller: false
    });

    await storage.createMenuItem({
      restaurantId: spiceJunction.id,
      categoryId: spiceJunctionCategories[0].id, // Recommended
      name: "Dal Makhani",
      description: "Black lentils slow cooked with cream",
      price: 199,
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af",
      rating: 4.7,
      numRatings: 150,
      isVeg: true,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: spiceJunction.id,
      categoryId: spiceJunctionCategories[1].id, // Starters
      name: "Chilli Paneer",
      description: "Crispy paneer tossed with bell peppers in a spicy sauce",
      price: 229,
      image: "https://images.unsplash.com/photo-1567188040759-fb8a254b3128",
      rating: 4.2,
      numRatings: 65,
      isVeg: true,
      isBestseller: false
    });

    await storage.createMenuItem({
      restaurantId: spiceJunction.id,
      categoryId: spiceJunctionCategories[2].id, // Main Course
      name: "Chicken Biryani",
      description: "Fragrant rice cooked with marinated chicken and spices",
      price: 329,
      image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
      rating: 4.8,
      numRatings: 200,
      isVeg: false,
      isBestseller: true
    });

    // Menu items for Golden Dragon
    await storage.createMenuItem({
      restaurantId: goldenDragon.id,
      categoryId: goldenDragonCategories[0].id, // Recommended
      name: "Kung Pao Chicken",
      description: "Stir-fried chicken with peanuts, vegetables and chili peppers",
      price: 349,
      image: "https://images.unsplash.com/photo-1525755662778-989d0524087e",
      rating: 4.6,
      numRatings: 110,
      isVeg: false,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: goldenDragon.id,
      categoryId: goldenDragonCategories[0].id, // Recommended
      name: "Dim Sum Platter",
      description: "Assorted steamed dumplings with various fillings",
      price: 399,
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d",
      rating: 4.7,
      numRatings: 95,
      isVeg: false,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: goldenDragon.id,
      categoryId: goldenDragonCategories[2].id, // Soups
      name: "Hot and Sour Soup",
      description: "Spicy and tangy soup with vegetables and tofu",
      price: 179,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
      rating: 4.5,
      numRatings: 70,
      isVeg: true,
      isBestseller: false
    });

    // Menu items for Urban Cafe
    await storage.createMenuItem({
      restaurantId: urbanCafe.id,
      categoryId: urbanCafeCategories[0].id, // Recommended
      name: "Cappuccino",
      description: "Espresso with steamed milk and a deep layer of foam",
      price: 159,
      image: "https://images.unsplash.com/photo-1534778101976-62847782c213",
      rating: 4.4,
      numRatings: 85,
      isVeg: true,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: urbanCafe.id,
      categoryId: urbanCafeCategories[0].id, // Recommended
      name: "Avocado Toast",
      description: "Multigrain toast topped with mashed avocado, cherry tomatoes and feta cheese",
      price: 229,
      image: "https://images.unsplash.com/photo-1603046891744-76035f536b5b",
      rating: 4.6,
      numRatings: 75,
      isVeg: true,
      isBestseller: true
    });

    await storage.createMenuItem({
      restaurantId: urbanCafe.id,
      categoryId: urbanCafeCategories[3].id, // Sandwiches
      name: "Grilled Chicken Sandwich",
      description: "Grilled chicken with lettuce, tomato and mayo on ciabatta bread",
      price: 249,
      image: "https://images.unsplash.com/photo-1554433607-66b5efe9d304",
      rating: 4.3,
      numRatings: 60,
      isVeg: false,
      isBestseller: false
    });
  }
}
