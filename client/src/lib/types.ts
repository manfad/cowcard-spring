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
export type Color = LookupEntity;
export type CowGender = LookupEntity;
export interface CowRole extends LookupEntity {
  cowGenders: CowGender[];
}
export interface CowStatus extends LookupEntity {
  cowRoles: CowRole[];
}
export interface PdStatus extends LookupEntity {
  color: string | null;
}

export interface PdStatusFormData {
  name: string;
  remark: string;
  color: string;
}

export interface CowRoleFormData {
  name: string;
  remark: string;
  cowGenderIds: number[];
}

export interface CowStatusFormData {
  name: string;
  remark: string;
  cowRoleIds: number[];
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
  genderId: number | null;
  role: string | null;
  roleId: number | null;
  status: string | null;
  statusId: number | null;
  weight: number | null;
  feedlot: string | null;
  feedlotId: number | null;
  transponder: string | null;
  transponderId: number | null;
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
  feedlotId: number | null;
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
  pregnantDate: string | null;
  aiRecordCode: string | null;
  aiRecordId: number | null;
  damId: number | null;
  damTag: string | null;
  semenId: number | null;
  semenName: string | null;
  diagnosisBy: string | null;
  pdStatusId: number | null;
  pdStatusName: string | null;
  pdStatusColor: string | null;
}

export interface RegisterCalfData {
  tag: string;
  genderId: number;
  dob: string;
  weight: number | null;
  colorId: number;
  feedlotId: number | null;
  remark: string;
  stillBirth: boolean;
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

// Dam AI Record
export interface AiRecordSummary {
  id: number;
  code: string;
  aiDate: string;
  semenName: string;
}

export interface BullAiSummary {
  id: number;
  code: string;
}

export interface DamAiRecord {
  damId: number;
  damTag: string;
  aiRecords: AiRecordSummary[];
  bullAiRecords: BullAiSummary[];
  lastAiDays: number | null;
}

// Detail page types
export interface ColorDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cows: { id: number; tag: string; gender: string; role: string; status: string }[];
}

export interface InseminatorDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  aiByRecords: { id: number; code: string; aiDate: string; damTag: string; semenName: string }[];
  preparedByRecords: { id: number; code: string; aiDate: string; damTag: string; semenName: string }[];
  diagnosisByRecords: { id: number; aiDate: string; aiRecordCode: string; pdStatus: string }[];
}

export interface GenderDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cows: { id: number; tag: string; role: string; feedlot: string }[];
}

export interface RoleDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cows: { id: number; tag: string; feedlot: string }[];
}

export interface StatusDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cows: { id: number; tag: string; role: string; feedlot: string }[];
}

export interface FeedlotDetail {
  id: number;
  name: string;
  remark: string | null;
  active: boolean | null;
  cows: { id: number; tag: string; role: string }[];
  history: { id: number; cowTag: string; movedInAt: string; movedOutAt: string | null }[];
}

export interface TransponderDetail {
  id: number;
  code: string;
  remark: string | null;
  currentCow: { id: number; tag: string } | null;
  history: { id: number; cowTag: string; assignedAt: string; unassignedAt: string | null }[];
}

export interface AiRecordDetail {
  id: number;
  code: string;
  aiDate: string | null;
  aiTime: string | null;
  date: string | null;
  remark: string | null;
  feedlot: string | null;
  damTag: string | null;
  damId: number | null;
  semenName: string | null;
  semenId: number | null;
  aiBy: string | null;
  preparedBy: string | null;
  status: string | null;
  pregnancyDiagnosis: { id: number; aiDate: string; diagnosisBy: string | null; pdStatus: string | null } | null;
  calfRecord: { id: number; cowTag: string | null; cowId: number | null } | null;
}

export interface SemenDetail {
  id: number;
  name: string;
  sire: string | null;
  date: string;
  straw: number | null;
  bull: boolean | null;
  remark: string | null;
  aiRecords: { id: number; code: string; aiDate: string; damTag: string; aiBy: string }[];
  cows: { id: number; tag: string; gender: string; role: string; feedlot: string }[];
}

export interface CowDetail {
  id: number;
  tag: string;
  dob: string | null;
  weight: number | null;
  remark: string | null;
  gender: string | null;
  color: string | null;
  role: string | null;
  status: string | null;
  feedlot: string | null;
  transponder: string | null;
  damTag: string | null;
  semenName: string | null;
  transponderHistory: { id: number; transponderCode: string; assignedAt: string; unassignedAt: string | null }[];
  feedlotHistory: { id: number; feedlotName: string; movedInAt: string; movedOutAt: string | null }[];
  aiRecords: { id: number; code: string; aiDate: string; aiTime: string; semenName: string; aiBy: string; preparedBy: string; feedlot: string; status: string }[];
  calves: { id: number; tag: string; dob: string; gender: string; color: string }[];
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
