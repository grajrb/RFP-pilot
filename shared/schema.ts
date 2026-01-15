import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const rfps = sqliteTable("rfps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  rawRequirements: text("raw_requirements").notNull(), // The user's natural language input
  structuredRequirements: text("structured_requirements"), // AI-parsed JSON structure (stored as JSON string)
  status: text("status").default("draft").notNull(), // 'draft', 'sent', 'closed'
  createdAt: text("created_at").default(new Date().toISOString()),
});

export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  rfpId: integer("rfp_id")
    .notNull()
    .references(() => rfps.id),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendors.id),
  rawResponse: text("raw_response").notNull(), // Email content
  structuredResponse: text("structured_response"), // AI-parsed JSON (stored as JSON string)
  score: integer("score"), // AI-assigned score (0-100)
  aiAnalysis: text("ai_analysis"), // AI reasoning
  createdAt: text("created_at").default(new Date().toISOString()),
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
