// Schema uses SQLite types for compatibility without a running MySQL server.
// Switch dialect in drizzle.config.ts to match your actual DB.
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  phone: text("phone").notNull().unique(),
  pin: text("pin").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["staff", "admin"] }).notNull().default("staff"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updatedAt").notNull().default(sql`(datetime('now'))`),
  lastSignedIn: text("lastSignedIn").notNull().default(sql`(datetime('now'))`),
});

export const receipts = sqliteTable("receipts", {
  id: text("id").primaryKey(),
  staffId: integer("staffId").notNull().references(() => users.id),
  customerName: text("customerName").notNull(),
  location: text("location").notNull(),
  date: text("date").notNull(),
  status: text("status", { enum: ["draft", "completed", "pending"] }).notNull().default("completed"),
  totalAmount: real("totalAmount").notNull().default(0),
  notes: text("notes").notNull().default(""),
  synced: integer("synced", { mode: "boolean" }).notNull().default(false),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updatedAt").notNull().default(sql`(datetime('now'))`),
});

export const receiptItems = sqliteTable("receipt_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptId: text("receiptId").notNull().references(() => receipts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: real("quantity").notNull().default(0),
  price: real("price").notNull().default(0),
  lineTotal: real("lineTotal").notNull().default(0),
});

export const receiptImages = sqliteTable("receipt_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  receiptId: text("receiptId").notNull().references(() => receipts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: text("publicId").notNull(),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DbReceipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type ReceiptItemRow = typeof receiptItems.$inferSelect;
export type ReceiptImageRow = typeof receiptImages.$inferSelect;
