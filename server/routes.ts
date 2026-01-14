import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import * as aiService from "./aiService";
import * as emailService from "./emailService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === Vendors ===
  app.get(api.vendors.list.path, async (req, res) => {
    const vendors = await storage.getVendors();
    res.json(vendors);
  });

  app.post(api.vendors.create.path, async (req, res) => {
    try {
      const input = api.vendors.create.input.parse(req.body);
      const vendor = await storage.createVendor(input);
      res.status(201).json(vendor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === RFPs ===
  app.get(api.rfps.list.path, async (req, res) => {
    const rfps = await storage.getRfps();
    res.json(rfps);
  });

  app.get(api.rfps.get.path, async (req, res) => {
    const rfp = await storage.getRfp(Number(req.params.id));
    if (!rfp) return res.status(404).json({ message: "RFP not found" });
    res.json(rfp);
  });

  app.post(api.rfps.create.path, async (req, res) => {
    try {
      const input = api.rfps.create.input.parse(req.body);
      const rfp = await storage.createRfp(input);
      res.status(201).json(rfp);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.rfps.update.path, async (req, res) => {
    try {
      const input = api.rfps.update.input.parse(req.body);
      const rfp = await storage.updateRfp(Number(req.params.id), input);
      if (!rfp) return res.status(404).json({ message: "RFP not found" });
      res.json(rfp);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.rfps.generate.path, async (req, res) => {
    try {
      const input = api.rfps.generate.input.parse(req.body);
      const result = await aiService.generateStructuredRfp(input.rawRequirements);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.post(api.rfps.send.path, async (req, res) => {
    try {
      const { vendorIds } = api.rfps.send.input.parse(req.body);
      const rfp = await storage.getRfp(Number(req.params.id));
      
      if (!rfp) return res.status(404).json({ message: "RFP not found" });

      // Get vendors
      const vendors = [];
      for (const vid of vendorIds) {
        const v = await storage.getVendor(vid);
        if (v) vendors.push(v);
      }

      await emailService.sendRfpEmail(vendors, rfp.title, rfp.structuredRequirements);
      await storage.updateRfp(rfp.id, { status: "sent" });

      res.json({ success: true, message: `Sent to ${vendors.length} vendors` });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // === Proposals ===
  app.get(api.proposals.list.path, async (req, res) => {
    const proposals = await storage.getProposals(Number(req.params.id));
    res.json(proposals);
  });

  // === Webhooks ===
  app.post(api.webhooks.email.path, async (req, res) => {
    try {
      const { from, subject, body } = api.webhooks.email.input.parse(req.body);
      
      // 1. Find vendor by email
      const vendor = await storage.getVendorByEmail(from);
      if (!vendor) {
        console.warn(`[Webhook] Unknown vendor email: ${from}`);
        return res.json({ success: false, message: "Unknown vendor" });
      }

      // 2. Identify RFP (Simple heuristic: Subject contains "RFP #{id}")
      // In a real app, use a unique reply-to ID or message ID
      const rfpIdMatch = subject.match(/RFP #(\d+)/i);
      if (!rfpIdMatch) {
         console.warn(`[Webhook] Could not parse RFP ID from subject: ${subject}`);
         return res.json({ success: false, message: "RFP ID not found in subject" });
      }
      const rfpId = parseInt(rfpIdMatch[1]);
      const rfp = await storage.getRfp(rfpId);

      if (!rfp) {
        return res.json({ success: false, message: "RFP not found" });
      }

      // 3. AI Analysis
      const analysis = await aiService.analyzeProposal(rfp.structuredRequirements, body);

      // 4. Create Proposal
      await storage.createProposal({
        rfpId,
        vendorId: vendor.id,
        rawResponse: body,
        structuredResponse: analysis.structuredResponse,
        score: analysis.score,
        aiAnalysis: analysis.analysis
      });

      res.json({ success: true });

    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  return httpServer;
}

// Seed function to populate data for demo
export async function seedDatabase() {
  const vendors = await storage.getVendors();
  if (vendors.length === 0) {
    await storage.createVendor({ name: "Acme Corp", email: "contact@acme.com", description: "General IT services" });
    await storage.createVendor({ name: "TechSolutions", email: "sales@techsolutions.com", description: "Specialized AI dev" });
    await storage.createVendor({ name: "Global Systems", email: "info@globalsystems.com", description: "Enterprise software" });
  }
}
