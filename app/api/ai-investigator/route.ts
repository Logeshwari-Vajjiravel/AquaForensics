import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { waterBody, question } = payload ?? {};

  const provider = process.env.AI_PROVIDER ?? "gemini";
  const apiKey = process.env.GEMINI_API_KEY;

  if (provider === "gemini" && apiKey) {
    try {
      const prompt = `You are an evidence-grounded environmental intelligence assistant. Use only the data provided. If the answer cannot be determined from the data, respond exactly with: "Insufficient data available."\n\nQuestion: ${question}\n\nWater body data: ${JSON.stringify(waterBody, null, 2)}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Insufficient data available.";
        return NextResponse.json({ answer: text.trim() || "Insufficient data available." });
      }
    } catch (error) {
      // fall through to local fallback below
    }
  }

  const fallback = buildFallbackAnswer(question, waterBody);
  return NextResponse.json({ answer: fallback });
}

function buildFallbackAnswer(question: string, waterBody: any) {
  if (!waterBody) return "Insufficient data available.";

  const loss = Math.max(0, ((waterBody.historicalArea - waterBody.currentArea) / waterBody.historicalArea) * 100);
  const percent = loss.toFixed(1);

  const answers: Record<string, string> = {
    "What happened to this water body?": `Satellite observations in the demonstration dataset show a persistent reduction in water extent over time. The historical footprint is ${waterBody.historicalArea} hectares, while the current footprint is ${waterBody.currentArea} hectares. This indicates a ${percent}% decline in observed water extent relative to the historical baseline.`,
    "How much water has been lost?": `The available dataset indicates ${waterBody.historicalArea - waterBody.currentArea} hectares of historical water area are no longer classified as water. This is equivalent to a ${percent}% reduction in the historical footprint.`,
    "What replaced the lost area?": `The current data suggests the lost area was replaced mainly by built-up land, roads, and agricultural/vegetated transitions. The exact mix varies by water body, and no legal conclusion is implied.`,
    "Why is this water body high priority?": `This water body ranks highly because it combines historical water loss, nearby urban development, and increased flood sensitivity. This is an analytical prioritization indicator, not a legal determination.`,
    "Summarize this investigation": `The investigation indicates a sustained decline in water extent, a reduction in storage capacity, and potential downstream exposure to flooding. These findings are supported by the dataset and should be treated as a prototype assessment.`,
  };

  return answers[question] ?? "Insufficient data available.";
}
