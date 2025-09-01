import { create } from "zustand";
import type { ID, CaseRecord } from "@/types/domain";
import { CasesApi } from "@/api/cases";

interface CasesState {
  casesByPatient: Record<ID, Record<ID, CaseRecord>>;
  orderByPatient: Record<ID, ID[]>;
  selectedCaseId: ID | null;
  loading: boolean;
  error: string | null;
  listByPatient: (patientId: ID) => Promise<void>;
  getCase: (patientId: ID, caseId: ID) => CaseRecord | undefined;
  createCase: (patientId: ID, data: Partial<CaseRecord>) => Promise<CaseRecord>;
  updateCase: (caseId: ID, data: Partial<CaseRecord>) => Promise<CaseRecord>;
  deleteCase: (patientId: ID, caseId: ID) => Promise<void>;
  selectCase: (id: ID | null) => void;
}

export const useCasesStore = create<CasesState>((set, get) => ({
  casesByPatient: {},
  orderByPatient: {},
  selectedCaseId: null,
  loading: false,
  error: null,
  selectCase: (id) => set({ selectedCaseId: id }),
  listByPatient: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const res = await CasesApi.listByPatient(patientId);
      const map: Record<ID, CaseRecord> = {};
      res.items.forEach((c) => (map[c.id] = c));
      set((s) => ({
        casesByPatient: { ...s.casesByPatient, [patientId]: map },
        orderByPatient: { ...s.orderByPatient, [patientId]: res.items.map((c) => c.id) },
      }));
    } catch (e: any) {
      set({ error: e?.data?.message || e?.message || "Failed to load cases" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
  getCase: (patientId, caseId) => get().casesByPatient[patientId]?.[caseId],
  createCase: async (patientId, data) => {
    const c = await CasesApi.create(patientId, data);
    set((s) => ({
      casesByPatient: { ...s.casesByPatient, [patientId]: { ...(s.casesByPatient[patientId] || {}), [c.id]: c } },
      orderByPatient: { ...s.orderByPatient, [patientId]: [c.id, ...(s.orderByPatient[patientId] || [])] },
    }));
    return c;
  },
  updateCase: async (caseId, data) => {
    const c = await CasesApi.update(caseId, data);
    set((s) => {
      const next = { ...s.casesByPatient };
      for (const pid of Object.keys(next)) {
        if (next[pid]?.[caseId]) {
          next[pid] = { ...next[pid], [caseId]: c };
          break;
        }
      }
      return { casesByPatient: next };
    });
    return c;
  },
  deleteCase: async (patientId, caseId) => {
    await CasesApi.remove(caseId);
    set((s) => {
      const map = { ...(s.casesByPatient[patientId] || {}) };
      delete map[caseId];
      return {
        casesByPatient: { ...s.casesByPatient, [patientId]: map },
        orderByPatient: { ...s.orderByPatient, [patientId]: (s.orderByPatient[patientId] || []).filter((id) => id !== caseId) },
        selectedCaseId: s.selectedCaseId === caseId ? null : s.selectedCaseId,
      };
    });
  },
}));
