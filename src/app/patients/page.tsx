"use client";

import useSWR from "swr";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  mrn: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PatientsPage() {
  const { data: patients, mutate } = useSWR<Patient[]>(
    "/api/patients/list",
    fetcher,
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "M",
    mrn: "",
    phone: "",
    email: "",
  });

  async function createPatient() {
    const res = await fetch("/api/patients/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({
        firstName: "",
        lastName: "",
        dob: "",
        sex: "M",
        mrn: "",
        phone: "",
        email: "",
      });
      mutate();
    } else {
      const err = await res.json();
      alert("Error: " + err.error);
    }
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Patients</h1>

      {/* Add new patient */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Patient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label>First Name</Label>
            <Input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Last Name</Label>
            <Input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Sex</Label>
            <select
              className="rounded-md border p-2"
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label>MRN</Label>
            <Input
              value={form.mrn}
              onChange={(e) => setForm({ ...form, mrn: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <Button onClick={createPatient}>Save Patient</Button>
        </CardContent>
      </Card>

      {/* Patients list */}
      <section className="space-y-2">
        <h2 className="text-xl font-medium">Patient List</h2>
        {patients?.length ? (
          <ul className="divide-y rounded-md border">
            {patients.map((p) => (
              <li key={p.id} className="flex justify-between p-3">
                <span>
                  {p.firstName} {p.lastName} — {p.dob} ({p.sex})
                </span>
                <span className="text-sm text-gray-500">MRN: {p.mrn}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No patients yet.</p>
        )}
      </section>
    </main>
  );
}
