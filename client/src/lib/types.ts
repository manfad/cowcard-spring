export interface ServerRes<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Auth
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface WhoAmI {
  id: string;
  email: string;
  name: string;
  admin: boolean;
}

// Lookup entities (all share: id, name, remark, active)
export interface LookupEntity {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
}

export interface LookupFormData {
  name: string;
  remark: string;
}

export type AiStatus = LookupEntity;
export type CalfStatus = LookupEntity;
export type Color = LookupEntity;
export type CowGender = LookupEntity;
export interface CowRole extends LookupEntity {
  cowGenders: CowGender[];
}
export type CowStatus = LookupEntity;
export type PdStatus = LookupEntity;

export interface CowRoleFormData {
  name: string;
  remark: string;
  cowGenderIds: number[];
}

export interface SemenFormData {
  name: string;
  sire: string;
  date: string;
  straw: number | null;
  bull: boolean;
  remark: string;
}

// Main entities
export interface Feedlot {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cowCount: number;
}

export interface Inseminator {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
}

export interface Semen {
  id: number;
  name: string;
  sire: string | null;
  date: string;
  straw: number | null;
  bull: boolean | null;
  remark: string | null;
}

export interface Transponder {
  id: number;
  code: string;
  currentCow: {
    id: number;
    tag: string;
    currentFeedlot: { id: number; name: string } | null;
  } | null;
  assignedDate: string | null;
  remark: string | null;
}

export interface Cow {
  id: number;
  tag: string;
  dob: string | null;
  weight: number | null;
  remark: string | null;
  gender: CowGender | null;
  color: Color | null;
  role: CowRole | null;
  status: CowStatus | null;
  dam: { id: number; tag: string } | null;
  semen: Semen | null;
  currentFeedlot: Feedlot | null;
  currentTransponder: Transponder | null;
}

export interface CowView {
  id: number;
  tag: string;
  gender: string | null;
  role: string | null;
  status: string | null;
  weight: number | null;
  feedlot: string | null;
  transponder: string | null;
  remark: string | null;
  active: boolean | null;
}

// Record entities
export interface AiRecord {
  id: number;
  code: string | null;
  date: string | null;
  aiDate: string | null;
  aiTime: string | null;
  remark: string | null;
  dam: { id: number; tag: string } | null;
  semen: { id: number; name: string } | null;
  feedlot: string | null;
  aiBy: { id: number; name: string } | null;
  preparedBy: { id: number; name: string } | null;
  status: { id: number; name: string } | null;
}

export interface CalfRecord {
  id: number;
  cow: { id: number; tag: string } | null;
  aiRecord: { id: number; code: string } | null;
  pregnancyDiagnosis: { id: number } | null;
}

export interface TransponderRecord {
  id: number;
  assignedDate: string;
  leaveDate: string | null;
  transponder: { id: number; code: string } | null;
  cow: { id: number; tag: string } | null;
  feedlot: { id: number; name: string } | null;
}

export interface CowFeedlotHistory {
  id: number;
  movedInAt: string;
  movedOutAt: string | null;
  cow: { id: number; tag: string } | null;
  feedlot: { id: number; name: string } | null;
}

export interface CowTransponderHistory {
  id: number;
  assignedAt: string;
  unassignedAt: string | null;
  cow: { id: number; tag: string } | null;
  transponder: { id: number; code: string } | null;
}

export interface PregnancyDiagnosis {
  id: number;
  aiDate: string;
  aiRecord: { id: number; code: string } | null;
  diagnosisBy: { id: number; name: string } | null;
  pdStatus: { id: number; name: string } | null;
}

export interface FeedlotWithCows {
  id: number;
  name: string;
  remark: string;
  active: boolean;
  cows: CowView[];
}

export interface AiRecordFormData {
  damId: number;
  semenId: number;
  aiDate: string;
  aiTime: string;
  aiById: number;
  preparedById: number;
  remark: string;
}

// Dam AI Overview
export interface AiRecordSummary {
  id: number;
  code: string;
  aiDate: string;
  semenName: string;
}

export interface DamAiOverview {
  damId: number;
  damTag: string;
  aiRecords: AiRecordSummary[];
}

// Form types
export interface DamOption {
  id: number;
  tag: string;
  currentFeedlot: { id: number; name: string } | null;
}

// System Settings
export interface SystemSetting {
  id: number;
  name: string;
  value: string;
  remark: string | null;
}

export interface SystemSettingFormData {
  name: string;
  value: string;
  remark: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  admin: boolean | null;
  approved: boolean | null;
  lastLogin: string | null;
  active: boolean | null;
}
