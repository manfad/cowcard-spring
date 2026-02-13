import axios from "axios";
import type {
  ServerRes,
  LoginRequest,
  RegisterRequest,
  WhoAmI,
  Cow,
  CowView,
  Feedlot,
  FeedlotWithCows,
  Inseminator,
  Semen,
  SemenFormData,
  Transponder,
  AiRecord,
  AiRecordFormData,
  DamAiOverview,
  CalfRecord,
  TransponderRecord,
  CowFeedlotHistory,
  CowTransponderHistory,
  PregnancyDiagnosis,
  AiStatus,
  CalfStatus,
  Color,
  CowGender,
  CowRole,
  CowRoleFormData,
  CowStatus,
  PdStatus,
  LookupFormData,
  DamOption,
  User,
  SystemSetting,
  SystemSettingFormData,
} from "./types";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ServerRes<string>>("/auth/login", data),
  register: (data: RegisterRequest) =>
    api.post<ServerRes<string>>("/auth/register", data),
  logout: () => api.post<ServerRes<string>>("/auth/logout"),
  whoami: () => api.get<ServerRes<WhoAmI>>("/auth/whoami"),
};

// Main entities
export const cowApi = {
  getAll: () => api.get<ServerRes<CowView[]>>("/cow/all"),
};

// Public form endpoints (no auth required)
export const formApi = {
  createDam: (data: { tag: string; statusId: number; remark?: string }) =>
    api.post<ServerRes<Cow>>("/form/dam", data),
  getCowStatuses: () =>
    api.get<ServerRes<CowStatus[]>>("/form/cow-statuses"),
  createCow: (data: {
    tag: string;
    genderId: number;
    roleId: number;
    colorId: number;
    dob: string;
    weight: number | null;
    statusId: number;
    damId: number | null;
    semenId: number | null;
    remark: string;
  }) => api.post<ServerRes<Cow>>("/form/cow", data),
  getCowGenders: () =>
    api.get<ServerRes<CowGender[]>>("/form/cow-genders"),
  getCowRoles: (genderId: number) =>
    api.get<ServerRes<CowRole[]>>(`/form/cow-roles?genderId=${genderId}`),
  getColors: () => api.get<ServerRes<Color[]>>("/form/colors"),
  getSemen: () => api.get<ServerRes<Semen[]>>("/form/semen"),
  getDams: () => api.get<ServerRes<DamOption[]>>("/form/dams"),
  createCalf: (data: {
    tag: string;
    genderId: number;
    damId: number | null;
    semenId: number | null;
    dob: string;
    weight: number | null;
    colorId: number;
    remark: string;
  }) => api.post<ServerRes<Cow>>("/form/calf", data),
};

export const feedlotApi = {
  getAll: () => api.get<ServerRes<Feedlot[]>>("/feedlot/all"),
  getWithCows: (id: number) =>
    api.get<ServerRes<FeedlotWithCows>>(`/feedlot/${id}/with-cows`),
  assignBulk: (feedlotId: number, cowIds: number[]) =>
    api.put<ServerRes<FeedlotWithCows>>(
      `/feedlot/assign-bulk/${feedlotId}`,
      cowIds
    ),
  unassignBulk: (cowIds: number[]) =>
    api.put<ServerRes<string>>("/feedlot/unassign-bulk", cowIds),
  toggleActive: (id: number) =>
    api.put<ServerRes<Feedlot>>(`/feedlot/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<Feedlot>>("/feedlot", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<Feedlot>>(`/feedlot/${id}`, data),
};

export const inseminatorApi = {
  getAll: () => api.get<ServerRes<Inseminator[]>>("/inseminator/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<Inseminator>>(`/inseminator/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<Inseminator>>("/inseminator", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<Inseminator>>(`/inseminator/${id}`, data),
};

export const semenApi = {
  getAll: () => api.get<ServerRes<Semen[]>>("/semen/all"),
  create: (data: SemenFormData) =>
    api.post<ServerRes<Semen>>("/semen", data),
  update: (id: number, data: SemenFormData) =>
    api.put<ServerRes<Semen>>(`/semen/${id}`, data),
  toggleBull: (id: number) =>
    api.put<ServerRes<Semen>>(`/semen/toggle-bull/${id}`),
};

export const transponderApi = {
  getAll: () => api.get<ServerRes<Transponder[]>>("/transponder/all"),
  create: (data: { code: string; remark: string }) =>
    api.post<ServerRes<Transponder>>("/transponder", data),
  update: (id: number, data: { code: string; remark: string }) =>
    api.put<ServerRes<Transponder>>(`/transponder/${id}`, data),
  assign: (transponderId: number, cowId: number) =>
    api.put<ServerRes<Transponder>>(
      `/transponder/assign/${transponderId}/${cowId}`
    ),
  unassign: (transponderId: number) =>
    api.put<ServerRes<Transponder>>(`/transponder/unassign/${transponderId}`),
};

// Record entities
export const aiRecordApi = {
  getAll: () => api.get<ServerRes<AiRecord[]>>("/ai-record/all"),
  create: (data: AiRecordFormData) =>
    api.post<ServerRes<AiRecord>>("/ai-record", data),
  getNextCode: () => api.get<ServerRes<string>>("/ai-record/next-code"),
  getDamAiCount: (damId: number) =>
    api.get<ServerRes<number>>(`/ai-record/dam-ai-count/${damId}`),
  getDamAiOverview: () =>
    api.get<ServerRes<DamAiOverview[]>>("/ai-record/dam-ai-overview"),
};

export const calfRecordApi = {
  getAll: () => api.get<ServerRes<CalfRecord[]>>("/calf-record/all"),
};

export const transponderRecordApi = {
  getAll: () =>
    api.get<ServerRes<TransponderRecord[]>>("/transponder-record/all"),
};

export const cowFeedlotHistoryApi = {
  getAll: () =>
    api.get<ServerRes<CowFeedlotHistory[]>>("/cow-feedlot-history/all"),
};

export const cowTransponderHistoryApi = {
  getAll: () =>
    api.get<ServerRes<CowTransponderHistory[]>>(
      "/cow-transponder-history/all"
    ),
};

export const pregnancyDiagnosisApi = {
  getAll: () =>
    api.get<ServerRes<PregnancyDiagnosis[]>>("/pregnancy-diagnosis/all"),
};

// Lookup entities
export const aiStatusApi = {
  getAll: () => api.get<ServerRes<AiStatus[]>>("/ai-status/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<AiStatus>>(`/ai-status/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<AiStatus>>("/ai-status", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<AiStatus>>(`/ai-status/${id}`, data),
};

export const calfStatusApi = {
  getAll: () => api.get<ServerRes<CalfStatus[]>>("/calf-status/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<CalfStatus>>(`/calf-status/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<CalfStatus>>("/calf-status", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<CalfStatus>>(`/calf-status/${id}`, data),
};

export const colorApi = {
  getAll: () => api.get<ServerRes<Color[]>>("/color/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<Color>>(`/color/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<Color>>("/color", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<Color>>(`/color/${id}`, data),
};

export const cowGenderApi = {
  getAll: () => api.get<ServerRes<CowGender[]>>("/cow-gender/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<CowGender>>(`/cow-gender/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<CowGender>>("/cow-gender", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<CowGender>>(`/cow-gender/${id}`, data),
};

export const cowRoleApi = {
  getAll: () => api.get<ServerRes<CowRole[]>>("/cow-role/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<CowRole>>(`/cow-role/toggle-active/${id}`),
  create: (data: CowRoleFormData) =>
    api.post<ServerRes<CowRole>>("/cow-role", data),
  update: (id: number, data: CowRoleFormData) =>
    api.put<ServerRes<CowRole>>(`/cow-role/${id}`, data),
};

export const cowStatusApi = {
  getAll: () => api.get<ServerRes<CowStatus[]>>("/cow-status/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<CowStatus>>(`/cow-status/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<CowStatus>>("/cow-status", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<CowStatus>>(`/cow-status/${id}`, data),
};

export const pdStatusApi = {
  getAll: () => api.get<ServerRes<PdStatus[]>>("/pd-status/all"),
  toggleActive: (id: number) =>
    api.put<ServerRes<PdStatus>>(`/pd-status/toggle-active/${id}`),
  create: (data: LookupFormData) =>
    api.post<ServerRes<PdStatus>>("/pd-status", data),
  update: (id: number, data: LookupFormData) =>
    api.put<ServerRes<PdStatus>>(`/pd-status/${id}`, data),
};

// Users
export const userApi = {
  getAll: () => api.get<ServerRes<User[]>>("/user/all"),
};

// System Settings
export const systemSettingApi = {
  getAll: () =>
    api.get<ServerRes<SystemSetting[]>>("/system-setting/all"),
  create: (data: SystemSettingFormData) =>
    api.post<ServerRes<SystemSetting>>("/system-setting", data),
  update: (id: number, data: SystemSettingFormData) =>
    api.put<ServerRes<SystemSetting>>(`/system-setting/${id}`, data),
};

export default api;
