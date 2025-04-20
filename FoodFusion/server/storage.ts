import { 
  users, User, InsertUser,
  restaurants, Restaurant, InsertRestaurant, 
  menuCategories, MenuCategory, InsertMenuCategory,
  menuItems, MenuItem, InsertMenuItem,
  carts, Cart, InsertCart,
  cartItems, CartItem, InsertCartItem,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  CartWithItems, CartItemWithDetails
} from "@shared/schema";

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Restaurant methods
  getRestaurants(): Promise<Restaurant[]>;
  getRestaurantById(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  // Menu Category methods
  getMenuCategoriesByRestaurantId(restaurantId: number): Promise<MenuCategory[]>;
  createMenuCategory(menuCategory: InsertMenuCategory): Promise<MenuCategory>;
  
  // Menu Item methods
  getMenuItemsByRestaurantId(restaurantId: number): Promise<MenuItem[]>;
  getMenuItemById(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByCategoryId(categoryId: number): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  
  // Cart methods
  getCartByUserId(userId: string): Promise<CartWithItems | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  deleteCartByUserId(userId: string): Promise<void>;
  
  // Cart Item methods
  addItemToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  removeCartItem(id: number): Promise<void>;
  
  // Order methods
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private menuCategories: Map<number, MenuCategory>;
  private menuItems: Map<number, MenuItem>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private restaurantId: number;
  private menuCategoryId: number;
  private menuItemId: number;
  private cartId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.menuCategories = new Map();
    this.menuItems = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.restaurantId = 1;
    this.menuCategoryId = 1;
    this.menuItemId = 1;
    this.cartId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // Restaurant methods
  async getRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }

  async getRestaurantById(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.restaurantId++;
    const newRestaurant: Restaurant = { ...restaurant, id };
    this.restaurants.set(id, newRestaurant);
    return newRestaurant;
  }

  // Menu Category methods
  async getMenuCategoriesByRestaurantId(restaurantId: number): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values()).filter(
      (category) => category.restaurantId === restaurantId
    );
  }

  async createMenuCategory(menuCategory: InsertMenuCategory): Promise<MenuCategory> {
    const id = this.menuCategoryId++;
    const newMenuCategory: MenuCategory = { ...menuCategory, id };
    this.menuCategories.set(id, newMenuCategory);
    return newMenuCategory;
  }

  // Menu Item methods
  async getMenuItemsByRestaurantId(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.restaurantId === restaurantId
    );
  }

  async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async getMenuItemsByCategoryId(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.categoryId === categoryId
    );
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.menuItemId++;
    const newMenuItem: MenuItem = { ...menuItem, id };
    this.menuItems.set(id, newMenuItem);
    return newMenuItem;
  }

  // Cart methods
  async getCartByUserId(userId: string): Promise<CartWithItems | undefined> {
    const cart = Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId
    );

    if (!cart) return undefined;

    const cartItemsList = Array.from(this.cartItems.values()).filter(
      (item) => item.cartId === cart.id
    );

    const cartItemsWithDetails: CartItemWithDetails[] = await Promise.all(
      cartItemsList.map(async (item) => {
        const menuItem = await this.getMenuItemById(item.menuItemId);
        return {
          ...item,
          menuItem: menuItem!
        };
      })
    );

    const restaurant = await this.getRestaurantById(cart.restaurantId);

    return {
      ...cart,
      items: cartItemsWithDetails,
      restaurant: restaurant!
    };
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartId++;
    const newCart: Cart = { 
      ...cart, 
      id, 
      createdAt: new Date() 
    };
    this.carts.set(id, newCart);
    return newCart;
  }

  async deleteCartByUserId(userId: string): Promise<void> {
    const cart = Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId
    );

    if (cart) {
      // Delete all cart items first
      for (const [id, item] of this.cartItems.entries()) {
        if (item.cartId === cart.id) {
          this.cartItems.delete(id);
        }
      }
      
      // Then delete the cart
      this.carts.delete(cart.id);
    }
  }

  // Cart Item methods
  async addItemToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.cartId === cartItem.cartId && 
               item.menuItemId === cartItem.menuItemId &&
               item.size === cartItem.size &&
               item.extras === cartItem.extras
    );

    if (existingItem) {
      // Update quantity of existing item
      return this.updateCartItemQuantity(
        existingItem.id, 
        existingItem.quantity + cartItem.quantity
      );
    }

    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) {
      throw new Error(`Cart item with id ${id} not found`);
    }

    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  // Order methods
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);

    // Add order items
    for (const item of items) {
      const orderItemId = this.orderItemId++;
      const newOrderItem: OrderItem = { 
        ...item, 
        id: orderItemId,
        orderId: id 
      };
      this.orderItems.set(orderItemId, newOrderItem);
    }

    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./database-storage";

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
