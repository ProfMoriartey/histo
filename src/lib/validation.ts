// ~/lib/validation.ts
import { z } from "zod";

export const MedicalHistorySchema = z.object({
  chiefComplaint: z.string().min(1),
  hpi: z.string().min(1),
  pastMedicalHistory: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  familyHistory: z.array(z.string()).default([]),
  socialHistory: z.array(z.string()).default([]),
  reviewOfSystems: z.array(z.string()).default([]),
  physicalExam: z.array(z.string()).default([]),
  assessment: z.string().min(1),
  plan: z.array(z.string()).default([]),
});

export const CreatePatientInput = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().min(4), // ISO date
  sex: z.enum(["M", "F", "Other"]),
  mrn: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type CreatePatientInput = z.infer<typeof CreatePatientInput>;
