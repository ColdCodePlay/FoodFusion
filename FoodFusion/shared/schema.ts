import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Restaurant Table
export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image").notNull(),
  cuisines: text("cuisines").notNull(),
  rating: doublePrecision("rating").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  priceRange: text("price_range").notNull(),
  distance: text("distance").notNull(),
  deliveryFee: text("delivery_fee").notNull(),
  promoted: boolean("promoted").default(false),
  offer: text("offer").notNull().default(""),
});

export const insertRestaurantSchema = createInsertSchema(restaurants).omit({
  id: true
});

// Menu Category Table
export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurants.id),
  name: text("name").notNull(),
});

export const insertMenuCategorySchema = createInsertSchema(menuCategories).omit({
  id: true
});

// Menu Item Table
export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id").notNull()
    .references(() => restaurants.id),
  categoryId: integer("category_id").notNull()
    .references(() => menuCategories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  rating: doublePrecision("rating").notNull().default(0),
  numRatings: integer("num_ratings").notNull().default(0),
  isVeg: boolean("is_veg").notNull().default(true),
  isBestseller: boolean("is_bestseller").notNull().default(false),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true
});

// Cart Table
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest"),
  restaurantId: integer("restaurant_id").notNull()
    .references(() => restaurants.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true
});

// Cart Item Table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull()
    .references(() => carts.id),
  menuItemId: integer("menu_item_id").notNull()
    .references(() => menuItems.id),
  quantity: integer("quantity").notNull().default(1),
  size: text("size").notNull().default("regular"),
  extras: text("extras").notNull().default(""),
  instructions: text("instructions").notNull().default(""),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true
});

// Order Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("guest"),
  restaurantId: integer("restaurant_id").notNull()
    .references(() => restaurants.id),
  total: integer("total").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("placed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});

// Order Item Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull()
    .references(() => orders.id),
  menuItemId: integer("menu_item_id").notNull()
    .references(() => menuItems.id),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
  size: text("size").notNull(),
  extras: text("extras").notNull().default(""),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true
});

// Define relationships
export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  menuCategories: many(menuCategories),
  menuItems: many(menuItems),
  carts: many(carts),
  orders: many(orders),
}));

export const menuCategoriesRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuCategories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [carts.restaurantId],
    references: [restaurants.id],
  }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  menuItem: one(menuItems, {
    fields: [cartItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderItems.menuItemId],
    references: [menuItems.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Restaurant = typeof restaurants.$inferSelect;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = z.infer<typeof insertMenuCategorySchema>;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Extended types for frontend
export type CartItemWithDetails = CartItem & {
  menuItem: MenuItem;
};

export type CartWithItems = Cart & {
  items: CartItemWithDetails[];
  restaurant: Restaurant;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  restaurant: Restaurant;
};
