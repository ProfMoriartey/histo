// ~/server/ai/transcribeAndExtract.ts
import OpenAI from "openai";
import { z } from "zod";
import { MedicalHistorySchema } from "~/lib/validation";
import { HISTORY_EXTRACTION_PROMPT } from "./prompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function runWhisperFromUrl(audioUrl: string): Promise<string> {
  // Fetch file into a Blob and send to Whisper
  const res = await fetch(audioUrl);
  const buf = Buffer.from(await res.arrayBuffer());
  const file = new File([buf], "audio.webm", { type: "audio/webm" });

  const tr = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    // Optional: language hint -> "en", "tr", "ar", etc.
  });
  return tr.text ?? "";
}

export async function extractHistoryWithGPT(transcript: string) {
  const completion = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: HISTORY_EXTRACTION_PROMPT },
      { role: "user", content: transcript },
    ],
    // The .parse call expects a schema:
    response_format: z.object(MedicalHistorySchema.shape),
  });

  const parsed = completion.output_parsed;
  return MedicalHistorySchema.parse(parsed);
}
