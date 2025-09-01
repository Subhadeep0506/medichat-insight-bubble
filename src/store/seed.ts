import { usePatientsStore } from "./patients";
import { useCasesStore } from "./cases";
import type { Patient } from "@/types/domain";

export function seedDemoIfEmpty() {
  const pStore = usePatientsStore.getState();
  const cStore = useCasesStore.getState();
  if (Object.keys(pStore.patients).length > 0) return;

  const demoPatients: Patient[] = [
    {
      id: "patient-1",
      name: "John Smith",
      age: 45,
      gender: "male",
      dob: new Date("1979-03-15").toISOString(),
      height: "175",
      weight: "80",
      medicalHistory: "Hypertension, Type 2 Diabetes",
      createdAt: "2023-12-01",
      updatedAt: "2024-01-15",
    },
    {
      id: "patient-2",
      name: "Sarah Johnson",
      age: 32,
      gender: "female",
      dob: new Date("1992-08-22").toISOString(),
      height: "165",
      weight: "65",
      medicalHistory: "Migraine, Anxiety",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-14",
    },
    {
      id: "patient-3",
      name: "Michael Brown",
      age: 58,
      gender: "male",
      dob: new Date("1966-11-10").toISOString(),
      height: "180",
      weight: "85",
      medicalHistory: "Coronary Artery Disease, High Cholesterol",
      createdAt: "2023-11-20",
      updatedAt: "2024-01-13",
    },
  ];

  demoPatients.forEach((p) => {
    // push directly without API
    pStore.patients[p.id] = p;
    if (!pStore.order.includes(p.id)) pStore.order.push(p.id);
  });

  // Cases
  const demoCases = [
    { id: "case-1", patientId: "patient-1", title: "Chest X-Ray Analysis", description: "Patient experiencing chest pain and shortness of breath", category: "radiology" as const },
    { id: "case-2", patientId: "patient-2", title: "Brain MRI Review", description: "Neurological examination following headaches", category: "neurology" as const },
    { id: "case-3", patientId: "patient-3", title: "Cardiac Echo Analysis", description: "Echocardiogram for heart function assessment", category: "cardiology" as const },
    { id: "case-4", patientId: "patient-1", title: "Blood Test Analysis", description: "Routine blood work for diabetes monitoring", category: "pathology" as const },
  ];

  demoCases.forEach((c) => {
    const pid = c.patientId;
    const m = (cStore.casesByPatient[pid] = cStore.casesByPatient[pid] || {});
    m[c.id] = {
      id: c.id,
      patientId: pid,
      title: c.title,
      description: c.description,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const order = (cStore.orderByPatient[pid] = cStore.orderByPatient[pid] || []);
    if (!order.includes(c.id)) order.push(c.id);
  });
}
