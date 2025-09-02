import { create } from "zustand";
import type { ID, Patient } from "@/types/domain";
import { PatientsApi } from "@/api/patients";

interface PatientsState {
  patients: Record<ID, Patient>;
  order: ID[];
  selectedPatientId: ID | null;
  loading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  fetchPatient: (id: ID) => Promise<Patient>;
  addPatient: (data: Partial<Patient>) => Promise<Patient>;
  updatePatient: (id: ID, data: Partial<Patient>) => Promise<Patient>;
  deletePatient: (id: ID) => Promise<void>;
  selectPatient: (id: ID | null) => void;
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
  patients: {},
  order: [],
  selectedPatientId: null,
  loading: false,
  error: null,
  selectPatient: (id) => set({ selectedPatientId: id }),
  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const res = await PatientsApi.list();
      console.log(`PATIENTS: ${res}`)
      const map: Record<ID, Patient> = {};
      res.items.forEach((p) => (map[p.id] = p));
      set({ patients: map, order: res.items.map((p) => p.id) });
    } catch (e: any) {
      const msg = `${e?.status ? e.status + " " : ""}${e?.data?.message || e?.message || "Failed to load patients"}`;
      set({ error: msg });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  fetchPatient: async (id) => {
    const cached = get().patients[id];
    if (cached) return cached;
    const p = await PatientsApi.get(id);
    set((s) => ({ patients: { ...s.patients, [id]: p }, order: s.order.includes(id) ? s.order : [...s.order, id] }));
    return p;
  },
  addPatient: async (data) => {
    const p = await PatientsApi.create(data);
    set((s) => ({ patients: { ...s.patients, [p.id]: p }, order: [p.id, ...s.order] }));
    return p;
  },
  updatePatient: async (id, data) => {
    const p = await PatientsApi.update(id, data);
    set((s) => ({ patients: { ...s.patients, [id]: p } }));
    return p;
  },
  deletePatient: async (id) => {
    await PatientsApi.remove(id);
    set((s) => {
      const { [id]: _, ...rest } = s.patients;
      return { patients: rest, order: s.order.filter((x) => x !== id), selectedPatientId: s.selectedPatientId === id ? null : s.selectedPatientId };
    });
  },
}));
