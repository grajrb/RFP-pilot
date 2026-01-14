import nodemailer from "nodemailer";
import type { Vendor, Rfp } from "@shared/schema";

/**
 * Email service using Nodemailer for SMTP.
 * Configure SMTP settings via environment variables:
 * - EMAIL_SMTP_HOST: SMTP server hostname
 * - EMAIL_SMTP_PORT: SMTP port (e.g., 587 for TLS)
 * - EMAIL_SMTP_USER: SMTP username
 * - EMAIL_SMTP_PASS: SMTP password
 * - EMAIL_FROM: Sender email address (e.g., noreply@company.com)
 */

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize the email transporter.
 * Called once at startup to validate SMTP credentials.
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.EMAIL_SMTP_HOST;
  const port = parseInt(process.env.EMAIL_SMTP_PORT || "587", 10);
  const user = process.env.EMAIL_SMTP_USER;
  const pass = process.env.EMAIL_SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn(
      "[Email Service] Missing SMTP configuration. Emails will be logged to console only."
    );
    // Return a mock transporter for development
    return nodemailer.createTransport({
      jsonTransport: true, // Returns JSON instead of sending
    });
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Use TLS for 587, SSL for 465
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send RFP via email to selected vendors.
 * Each vendor receives a personalized email with RFP details.
 */
export async function sendRfpEmail(
  vendors: Vendor[],
  rfpTitle: string,
  rfpContent: any
): Promise<void> {
  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || "noreply@rfp-system.local";

  for (const vendor of vendors) {
    try {
      const emailBody = formatRfpEmail(rfpTitle, rfpContent, vendor.name);

      const result = await transporter.sendMail({
        from: fromAddress,
        to: vendor.email,
        subject: `Request for Proposal: ${rfpTitle}`,
        html: emailBody,
        text: stripHtml(emailBody),
        // Store message ID for reply tracking
        headers: {
          "X-RFP-System": "true",
        },
      });

      console.log(
        `[Email Service] RFP sent to ${vendor.email}, Message ID: ${result.messageId}`
      );
    } catch (error) {
      console.error(
        `[Email Service] Failed to send RFP to ${vendor.email}:`,
        error
      );
      throw error;
    }
  }
}

/**
 * Format RFP content as HTML email.
 */
function formatRfpEmail(title: string, content: any, vendorName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
      <h1 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
        ${title}
      </h1>
      
      <p>Dear ${vendorName},</p>
      
      <p>We are seeking qualified vendors for the following opportunity:</p>
      
      ${content.summary ? `<p><strong>Summary:</strong> ${content.summary}</p>` : ""}
      
      ${
        content.deliverables && content.deliverables.length > 0
          ? `
        <h2>Deliverables:</h2>
        <ul>
          ${content.deliverables.map((d: string) => `<li>${d}</li>`).join("")}
        </ul>
      `
          : ""
      }
      
      ${content.timeline ? `<p><strong>Timeline:</strong> ${content.timeline}</p>` : ""}
      ${content.budget ? `<p><strong>Budget:</strong> ${content.budget}</p>` : ""}
      ${
        content.constraints && content.constraints.length > 0
          ? `<p><strong>Constraints:</strong> ${content.constraints.join(", ")}</p>`
          : ""
      }
      
      <h2>Response Instructions:</h2>
      <p>Please reply to this email with your proposal by <strong>[DEADLINE]</strong>.</p>
      <p>Include pricing, timeline, relevant experience, and how you meet each requirement.</p>
      
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 0.9em; color: #666;">
        This is an automated message from the RFP Management System.
        Please do not modify the subject line when replying.
      </p>
    </div>
  `;
}

/**
 * Strip HTML tags from a string (basic implementation).
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse inbound email and extract proposal content.
 * In production, this would integrate with email webhooks or polling.
 * For now, it's used for manual email submission via API.
 */
export async function parseInboundEmail(
  from: string,
  subject: string,
  body: string
): Promise<string> {
  console.log(
    `[Email Service] Received inbound email from ${from}: ${subject}`
  );

  // In a real system, you'd:
  // 1. Extract the original RFP from the subject line (via X-RFP-ID header)
  // 2. Parse attachments if present
  // 3. Clean up quoted text from previous emails
  // 4. Return the vendor's proposal content

  // For demo purposes, we return the body as-is
  return body;
}

/**
 * Extract email metadata from an inbound message.
 * Returns vendor email and subject for matching to RFP.
 */
export function extractEmailMetadata(
  from: string,
  subject: string
): { vendorEmail: string; rfpClue: string } {
  return {
    vendorEmail: from.toLowerCase().trim(),
    rfpClue: subject.toLowerCase(),
  };
}
