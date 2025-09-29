// ~/tests/extractor.test.ts
import { describe, it, expect } from "vitest";
import { MedicalHistorySchema } from "~/lib/validation";

describe("Extractor output shape", () => {
  it("is valid against schema", () => {
    const sample = {
      chiefComplaint: "Cough",
      hpi: "Dry cough for 1 week",
      pastMedicalHistory: ["Hypertension"],
      medications: ["Lisinopril"],
      allergies: ["Penicillin"],
      familyHistory: [],
      socialHistory: ["Non-smoker"],
      reviewOfSystems: ["No fever"],
      physicalExam: ["Clear lungs"],
      assessment: "Viral URI",
      plan: ["Rest"],
    };
    expect(() => MedicalHistorySchema.parse(sample)).not.toThrow();
  });
});
