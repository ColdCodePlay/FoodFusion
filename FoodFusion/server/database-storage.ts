import { IStorage } from "./storage";
import { 
  users, User, InsertUser,
  restaurants, Restaurant, InsertRestaurant,
  menuCategories, MenuCategory, InsertMenuCategory,
  menuItems, MenuItem, InsertMenuItem,
  carts, Cart, InsertCart, CartWithItems,
  cartItems, CartItem, InsertCartItem, CartItemWithDetails,
  orders, Order, InsertOrder, OrderWithItems,
  orderItems, OrderItem, InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants);
  }

  async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    const result = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return result[0];
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const [newRestaurant] = await db.insert(restaurants).values(restaurant).returning();
    return newRestaurant;
  }

  // Menu Category methods
  async getMenuCategoriesByRestaurantId(restaurantId: number): Promise<MenuCategory[]> {
    return await db.select()
      .from(menuCategories)
      .where(eq(menuCategories.restaurantId, restaurantId));
  }

  async createMenuCategory(menuCategory: InsertMenuCategory): Promise<MenuCategory> {
    const [newMenuCategory] = await db.insert(menuCategories).values(menuCategory).returning();
    return newMenuCategory;
  }

  // Menu Item methods
  async getMenuItemsByRestaurantId(restaurantId: number): Promise<MenuItem[]> {
    return await db.select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId));
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    const result = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return result[0];
  }

  async getMenuItemsByCategoryId(categoryId: number): Promise<MenuItem[]> {
    return await db.select()
      .from(menuItems)
      .where(eq(menuItems.categoryId, categoryId));
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db.insert(menuItems).values(menuItem).returning();
    return newMenuItem;
  }

  // Cart methods
  async getCartByUserId(userId: string): Promise<CartWithItems | undefined> {
    // Get cart
    const cartResult = await db.select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .orderBy(desc(carts.createdAt))
      .limit(1);
    
    const cart = cartResult[0];
    if (!cart) return undefined;

    // Get restaurant
    const restaurantResult = await db.select()
      .from(restaurants)
      .where(eq(restaurants.id, cart.restaurantId));
    
    const restaurant = restaurantResult[0];
    if (!restaurant) return undefined;

    // Get cart items
    const cartItemsResult = await db.select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    // Get menu items for cart items
    const cartItemsWithDetails: CartItemWithDetails[] = [];
    
    for (const item of cartItemsResult) {
      const menuItemResult = await db.select()
        .from(menuItems)
        .where(eq(menuItems.id, item.menuItemId));
      
      if (menuItemResult[0]) {
        cartItemsWithDetails.push({
          ...item,
          menuItem: menuItemResult[0]
        });
      }
    }

    return {
      ...cart,
      restaurant,
      items: cartItemsWithDetails
    };
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const [newCart] = await db.insert(carts).values(cart).returning();
    return newCart;
  }

  async deleteCartByUserId(userId: string): Promise<void> {
    const userCarts = await db.select()
      .from(carts)
      .where(eq(carts.userId, userId));
    
    for (const cart of userCarts) {
      // Delete all cart items first
      await db.delete(cartItems)
        .where(eq(cartItems.cartId, cart.id));
      
      // Then delete the cart
      await db.delete(carts)
        .where(eq(carts.id, cart.id));
    }
  }

  // Cart Item methods
  async addItemToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItems = await db.select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartItem.cartId),
          eq(cartItems.menuItemId, cartItem.menuItemId),
          eq(cartItems.size, cartItem.size || 'regular'),
          eq(cartItems.extras, cartItem.extras || '')
        )
      );
    
    if (existingItems.length > 0) {
      // Update quantity of existing item
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + (cartItem.quantity || 1);
      
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      
      return updatedItem;
    } else {
      // Add new item
      const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
      return newCartItem;
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const [updatedCartItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems)
      .where(eq(cartItems.id, id));
  }

  // Order methods
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create order
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Add order items
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId: newOrder.id
      });
    }
    
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
}