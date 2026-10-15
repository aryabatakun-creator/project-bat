import { CaseItem, MasterArea, MasterCategory, MasterPic } from "./types";

export const initialCategories: MasterCategory[] = [
  { id: "cat-1", name: "Operasional" },
  { id: "cat-2", name: "Manpower" },
  { id: "cat-3", name: "HR & Industrial Relation" },
  { id: "cat-4", name: "Equipment & Uniform" },
  { id: "cat-5", name: "Administrasi & Billing" },
  { id: "cat-6", name: "Training & Competency" },
  { id: "cat-7", name: "HSE & Compliance" },
  { id: "cat-8", name: "Facility & Infrastructure" },
  { id: "cat-9", name: "Client Request" },
];

export const initialAreas: MasterArea[] = [
  { id: "area-1", name: "Malang" },
  { id: "area-2", name: "Malang - KR4" },
  { id: "area-3", name: "Malang Selatan" },
  { id: "area-4", name: "Singosari" },
  { id: "area-5", name: "Singosari - Artemis" },
  { id: "area-6", name: "Jakarta (HO)" },
  { id: "area-7", name: "Karanglo" },
  { id: "area-8", name: "Semeru" },
];

export const initialPics: MasterPic[] = [
  { id: "pic-1", name: "Erlangga", role: "Operational Lead" },
  { id: "pic-2", name: "Rokhim", role: "Manpower Coordinator" },
  { id: "pic-3", name: "Riski Yunani", role: "Training Specialist" },
  { id: "pic-4", name: "Deni Nur", role: "Billing Lead" },
  { id: "pic-5", name: "Logistik", role: "Logistics Division" },
  { id: "pic-6", name: "HSE", role: "HSE Division" },
  { id: "pic-7", name: "Facility", role: "Facility Team" },
  { id: "pic-8", name: "HR", role: "HR Team" },
  { id: "pic-9", name: "DJT", role: "Dispatcher" },
  { id: "pic-10", name: "Prima", role: "Instructor" },
  { id: "pic-11", name: "Kudiyanto", role: "Account Lead" },
  { id: "pic-12", name: "Aminudin", role: "Field Supervisor" },
];

// Cases loaded dynamically from Supabase database
export const initialCases: CaseItem[] = [];

