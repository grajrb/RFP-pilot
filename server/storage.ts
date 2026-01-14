import { db } from "./db";
import {
  vendors, rfps, proposals,
  type InsertVendor, type InsertRfp, type InsertProposal,
  type Vendor, type Rfp, type Proposal
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Vendors
  getVendors(): Promise<Vendor[]>;
  getVendor(id: number): Promise<Vendor | undefined>;
  getVendorByEmail(email: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;

  // RFPs
  getRfps(): Promise<Rfp[]>;
  getRfp(id: number): Promise<Rfp | undefined>;
  createRfp(rfp: InsertRfp): Promise<Rfp>;
  updateRfp(id: number, updates: Partial<InsertRfp>): Promise<Rfp>;

  // Proposals
  getProposals(rfpId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
}

export class DatabaseStorage implements IStorage {
  // Vendors
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors);
  }

  async getVendor(id: number): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByEmail(email: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  // RFPs
  async getRfps(): Promise<Rfp[]> {
    return await db.select().from(rfps).orderBy(desc(rfps.createdAt));
  }

  async getRfp(id: number): Promise<Rfp | undefined> {
    const [rfp] = await db.select().from(rfps).where(eq(rfps.id, id));
    return rfp;
  }

  async createRfp(rfp: InsertRfp): Promise<Rfp> {
    const [newRfp] = await db.insert(rfps).values(rfp).returning();
    return newRfp;
  }

  async updateRfp(id: number, updates: Partial<InsertRfp>): Promise<Rfp> {
    const [updated] = await db.update(rfps).set(updates).where(eq(rfps.id, id)).returning();
    return updated;
  }

  // Proposals
  async getProposals(rfpId: number): Promise<Proposal[]> {
    return await db.select().from(proposals).where(eq(proposals.rfpId, rfpId));
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db.insert(proposals).values(proposal).returning();
    return newProposal;
  }
}

export const storage = new DatabaseStorage();
