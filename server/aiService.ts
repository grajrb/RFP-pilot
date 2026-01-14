import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a structured RFP from raw natural language requirements.
 * Calls GPT-4 to convert unstructured text into JSON with title, summary, deliverables, etc.
 */
export async function generateStructuredRfp(
  rawRequirements: string
): Promise<{ title: string; structuredRequirements: any }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert at converting natural language RFP requirements into structured JSON.
Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "title": "A clear, concise title for this RFP",
  "summary": "One paragraph summary of what is being requested",
  "deliverables": ["Item 1", "Item 2", ...],
  "timeline": "Expected delivery timeline",
  "budget": "Budget range or TBD",
  "constraints": ["Constraint 1", "Constraint 2", ...],
  "successCriteria": ["Criterion 1", "Criterion 2", ...]
}`,
        },
        {
          role: "user",
          content: `Convert these requirements into structured JSON:\n\n${rawRequirements}`,
        },
      ],
    });

    const content = response.choices[0].message.content || "{}";
    const structured = JSON.parse(content);

    return {
      title: structured.title || "Untitled RFP",
      structuredRequirements: structured,
    };
  } catch (error) {
    console.error("Error in generateStructuredRfp:", error);
    throw new Error(
      `Failed to generate structured RFP: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Analyze a vendor proposal against the RFP requirements.
 * Returns score, structured response, and AI analysis.
 */
export async function analyzeProposal(
  rfpContent: any,
  proposalContent: string
): Promise<{ score: number; analysis: string; structuredResponse: any }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are an expert procurement analyst. Analyze this vendor proposal against the RFP requirements.
Return ONLY valid JSON (no markdown) with this exact structure:
{
  "score": <0-100 integer>,
  "analysis": "1-2 sentence assessment",
  "structuredResponse": {
    "matches": ["Requirement that is addressed"],
    "gaps": ["Requirement that is missing or unclear"],
    "proposed_timeline": "Timeline provided by vendor",
    "proposed_budget": "Price/cost provided by vendor",
    "strengths": ["What the vendor does well"],
    "weaknesses": ["Areas of concern"]
  }
}

Scoring: 90-100 = Excellent match, 70-89 = Good match, 50-69 = Adequate match, <50 = Poor match`,
        },
        {
          role: "user",
          content: `RFP Requirements:\n${JSON.stringify(rfpContent, null, 2)}\n\nVendor Proposal:\n${proposalContent}`,
        },
      ],
    });

    const content = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(content);

    return {
      score: analysis.score || 0,
      analysis: analysis.analysis || "No analysis available",
      structuredResponse: analysis.structuredResponse || {},
    };
  } catch (error) {
    console.error("Error in analyzeProposal:", error);
    throw new Error(
      `Failed to analyze proposal: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate an AI recommendation comparing vendors and recommending the best fit.
 * Takes all proposals for an RFP and returns a human-readable recommendation.
 */
export async function generateRecommendation(
  rfpTitle: string,
  rfpContent: any,
  proposals: Array<{ vendorName: string; score: number; analysis: any }>
): Promise<{ recommendation: string; reasoning: string }> {
  try {
    const proposalsSummary = proposals
      .map(
        (p) =>
          `${p.vendorName}: Score ${p.score}/100, Strengths: ${(p.analysis.structuredResponse?.strengths || []).join(", ")}, Gaps: ${(p.analysis.structuredResponse?.gaps || []).join(", ")}`
      )
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `You are a procurement advisor. Given vendor proposals for an RFP, provide a clear recommendation.
Consider price, delivery timeline, completeness of proposal, and ability to meet requirements.
Return ONLY valid JSON (no markdown) with this structure:
{
  "recommendation": "Name of recommended vendor",
  "reasoning": "2-3 sentences explaining why this vendor is the best choice, including specific factors like cost, timeline, capability gaps, etc."
}`,
        },
        {
          role: "user",
          content: `RFP: ${rfpTitle}\nRequirements: ${JSON.stringify(rfpContent, null, 2)}\n\nVendor Proposals:\n${proposalsSummary}`,
        },
      ],
    });

    const content = response.choices[0].message.content || "{}";
    const recommendation = JSON.parse(content);

    return {
      recommendation: recommendation.recommendation || "Unable to determine",
      reasoning: recommendation.reasoning || "No reasoning available",
    };
  } catch (error) {
    console.error("Error in generateRecommendation:", error);
    throw new Error(
      `Failed to generate recommendation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
