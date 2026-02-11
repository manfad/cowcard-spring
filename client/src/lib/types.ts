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

// Base fields from BaseEntity
export interface BaseEntity {
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

// Lookup entities (all share: id, name, remark, active)
export interface LookupEntity extends BaseEntity {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
}

export type AiStatus = LookupEntity;
export type CalfStatus = LookupEntity;
export type Color = LookupEntity;
export type CowGender = LookupEntity;
export type CowRole = LookupEntity;
export type CowStatus = LookupEntity;
export type PdStatus = LookupEntity;

// Main entities
export interface Feedlot extends BaseEntity {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
}

export interface Inseminator extends BaseEntity {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
}

export interface Semen extends BaseEntity {
  id: number;
  name: string;
  sireId: string | null;
  date: string;
  straw: number | null;
  bull: boolean | null;
  remark: string | null;
}

export interface Transponder extends BaseEntity {
  id: number;
  code: string;
  currentCow: number | null;
  assignedDate: string | null;
  remark: string | null;
  currentFeedlot: Feedlot | null;
}

export interface Cow extends BaseEntity {
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

// Record entities
export interface AiRecord extends BaseEntity {
  id: number;
  code: string | null;
  date: string | null;
  aiDate: string | null;
  aiTime: string | null;
  remark: string | null;
  dam: { id: number; tag: string } | null;
  semen: { id: number; name: string } | null;
  feedlot: { id: number; name: string } | null;
  aiBy: { id: number; name: string } | null;
  preparedBy: { id: number; name: string } | null;
  status: { id: number; name: string } | null;
}

export interface CalfRecord extends BaseEntity {
  id: number;
  cow: { id: number; tag: string } | null;
  aiRecord: { id: number; code: string } | null;
  pregnancyDiagnosis: { id: number } | null;
}

export interface TransponderRecord extends BaseEntity {
  id: number;
  assignedDate: string;
  leaveDate: string | null;
  transponder: { id: number; code: string } | null;
  cow: { id: number; tag: string } | null;
  feedlot: { id: number; name: string } | null;
}

export interface CowFeedlotHistory extends BaseEntity {
  id: number;
  movedInAt: string;
  movedOutAt: string | null;
  cow: { id: number; tag: string } | null;
  feedlot: { id: number; name: string } | null;
}

export interface CowTransponderHistory extends BaseEntity {
  id: number;
  assignedAt: string;
  unassignedAt: string | null;
  cow: { id: number; tag: string } | null;
  transponder: { id: number; code: string } | null;
}

export interface PregnancyDiagnosis extends BaseEntity {
  id: number;
  aiDate: string;
  aiRecord: { id: number; code: string } | null;
  diagnosisBy: { id: number; name: string } | null;
  pdStatus: { id: number; name: string } | null;
}

// User
export interface User extends BaseEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  admin: boolean | null;
  approved: boolean | null;
  lastLogin: string | null;
  active: boolean | null;
}
