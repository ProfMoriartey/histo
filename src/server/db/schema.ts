// ~/server/db/schema.ts
import { pgTable, text, timestamp, varchar, uuid, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Clerk user id
  clerkUserId: varchar("clerk_user_id", { length: 256 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  // Encrypted at rest (see crypto helpers). Store base64 ciphertexts.
  firstNameEnc: text("first_name_enc").notNull(),
  lastNameEnc: text("last_name_enc").notNull(),
  dobEnc: text("dob_enc").notNull(),          // ISO string encrypted
  sexEnc: text("sex_enc").notNull(),
  mrnEnc: text("mrn_enc").notNull(),          // medical record number
  phoneEnc: text("phone_enc"),
  emailEnc: text("email_enc"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  archived: boolean("archived").default(false).notNull(),
});

export const visits = pgTable("visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  visitDate: timestamp("visit_date", { withTimezone: true }).defaultNow().notNull(),
  audioUrl: text("audio_url"), // UploadThing file URL
  transcriptEnc: text("transcript_enc"), // Encrypted transcript
  structuredHistoryEnc: text("structured_history_enc"), // Encrypted JSON string
  templateId: uuid("template_id").references(() => templates.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  // JSON schema for form layout / sections / fields
  schemaJson: jsonb("schema_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorClerkUserId: varchar("actor_clerk_user_id", { length: 256 }).notNull(),
  doctorId: uuid("doctor_id").references(() => doctors.id),
  patientId: uuid("patient_id").references(() => patients.id),
  visitId: uuid("visit_id").references(() => visits.id),
  action: varchar("action", { length: 64 }).notNull(), // CREATE_PATIENT, READ_VISIT, UPDATE_VISIT, EXPORT_PDF, etc.
  ip: varchar("ip", { length: 64 }),
  ua: text("ua"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const doctorsRelations = relations(doctors, ({ many }) => ({
  patients: many(patients),
  templates: many(templates),
  visits: many(visits),
}));

export const patientsRelations = relations(patients, ({ many, one }) => ({
  doctor: one(doctors, { fields: [patients.doctorId], references: [doctors.id] }),
  visits: many(visits),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  patient: one(patients, { fields: [visits.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [visits.doctorId], references: [doctors.id] }),
  template: one(templates, { fields: [visits.templateId], references: [templates.id] }),
}));
