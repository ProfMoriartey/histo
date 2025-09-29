// ~/server/pdf/PDFDoc.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11 },
  h1: { fontSize: 16, marginBottom: 8 },
  section: { marginTop: 10, marginBottom: 6 },
  label: { fontWeight: 700, marginBottom: 2 },
});

export function PDFDoc({ doctor, patient, structured, visit }: any) {
  const sec = (label: string, val: string | string[]) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text>{Array.isArray(val) ? val.join("; ") : val}</Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Patient History</Text>
        <Text>Doctor: {doctor?.name}</Text>
        <Text>Visit: {new Date(visit.visitDate).toLocaleString()}</Text>
        {sec("Chief Complaint", structured?.chiefComplaint ?? "")}
        {sec("HPI", structured?.hpi ?? "")}
        {sec("Past Medical History", structured?.pastMedicalHistory ?? [])}
        {sec("Medications", structured?.medications ?? [])}
        {sec("Allergies", structured?.allergies ?? [])}
        {sec("Family History", structured?.familyHistory ?? [])}
        {sec("Social History", structured?.socialHistory ?? [])}
        {sec("Review of Systems", structured?.reviewOfSystems ?? [])}
        {sec("Physical Exam", structured?.physicalExam ?? [])}
        {sec("Assessment", structured?.assessment ?? "")}
        {sec("Plan", structured?.plan ?? [])}
      </Page>
    </Document>
  );
}
