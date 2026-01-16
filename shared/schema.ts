import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rfps = pgTable("rfps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  rawRequirements: text("raw_requirements").notNull(), // The user's natural language input
  structuredRequirements: jsonb("structured_requirements"), // AI-parsed JSON structure
  status: text("status", { enum: ["draft", "sent", "closed"] }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  rfpId: integer("rfp_id").references(() => rfps.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  rawResponse: text("raw_response").notNull(), // Email content
  structuredResponse: jsonb("structured_response"), // AI-parsed JSON
  score: integer("score"), // AI-assigned score (0-100)
  aiAnalysis: text("ai_analysis"), // AI reasoning
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true });
export const insertRfpSchema = createInsertSchema(rfps).omit({ id: true, createdAt: true });
export const insertProposalSchema = createInsertSchema(proposals).omit({ id: true, createdAt: true });

// === TYPES ===

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export type Rfp = typeof rfps.$inferSelect;
export type InsertRfp = z.infer<typeof insertRfpSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// === API CONTRACT TYPES ===

// For AI Generation Request
export const generateRfpSchema = z.object({
  rawRequirements: z.string(),
});
export type GenerateRfpRequest = z.infer<typeof generateRfpSchema>;

// For sending RFP
export const sendRfpSchema = z.object({
  vendorIds: z.array(z.number()),
});
export type SendRfpRequest = z.infer<typeof sendRfpSchema>;

// For inbound email simulation
export const inboundEmailSchema = z.object({
  from: z.string().email(),
  subject: z.string(),
  body: z.string(),
});
export type InboundEmailRequest = z.infer<typeof inboundEmailSchema>;
