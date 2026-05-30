import { mysqlTable, serial, varchar, text, timestamp, double, boolean, int, mysqlEnum } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).notNull().default("user"),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
  lastSignedIn: timestamp("lastSignedIn").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const receipts = mysqlTable("receipts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  staffId: int("staffId").notNull().references(() => users.id),
  customerName: text("customerName").notNull(),
  location: text("location").notNull(),
  date: varchar("date", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["draft", "completed", "pending"]).notNull().default("completed"),
  totalAmount: double("totalAmount").notNull().default(0),
  notes: text("notes").notNull(),
  synced: boolean("synced").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`CURRENT_TIMESTAMP`).onUpdateNow(),
});

export const receiptItems = mysqlTable("receipt_items", {
  id: serial("id").primaryKey(),
  receiptId: varchar("receiptId", { length: 64 }).notNull().references(() => receipts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: double("quantity").notNull().default(0),
  price: double("price").notNull().default(0),
  lineTotal: double("lineTotal").notNull().default(0),
});

export const receiptImages = mysqlTable("receipt_images", {
  id: serial("id").primaryKey(),
  receiptId: varchar("receiptId", { length: 64 }).notNull().references(() => receipts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  publicId: text("publicId").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type DbReceipt = typeof receipts.$inferSelect;
export type InsertReceipt = typeof receipts.$inferInsert;
export type ReceiptItemRow = typeof receiptItems.$inferSelect;
export type ReceiptImageRow = typeof receiptImages.$inferSelect;
