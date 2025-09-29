// ~/tests/validation.test.ts
import { describe, it, expect } from "vitest";
import { MedicalHistorySchema } from "~/lib/validation";

describe("MedicalHistorySchema", () => {
  it("accepts a minimal valid object", () => {
    const obj = {
      chiefComplaint: "Headache",
      hpi: "3 days of frontal headache",
      pastMedicalHistory: [],
      medications: [],
      allergies: [],
      familyHistory: [],
      socialHistory: [],
      reviewOfSystems: [],
      physicalExam: [],
      assessment: "Tension headache",
      plan: ["NSAIDs", "Hydration"],
    };
    expect(MedicalHistorySchema.parse(obj)).toBeTruthy();
  });
});
