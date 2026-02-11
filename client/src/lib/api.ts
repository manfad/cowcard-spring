import axios from "axios";
import type {
  ServerRes,
  LoginRequest,
  RegisterRequest,
  WhoAmI,
  Cow,
  Feedlot,
  Inseminator,
  Semen,
  Transponder,
  AiRecord,
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
  CowStatus,
  PdStatus,
  User,
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
  getAll: () => api.get<ServerRes<Cow[]>>("/cow/all"),
};

export const feedlotApi = {
  getAll: () => api.get<ServerRes<Feedlot[]>>("/feedlot/all"),
};

export const inseminatorApi = {
  getAll: () => api.get<ServerRes<Inseminator[]>>("/inseminator/all"),
};

export const semenApi = {
  getAll: () => api.get<ServerRes<Semen[]>>("/semen/all"),
};

export const transponderApi = {
  getAll: () => api.get<ServerRes<Transponder[]>>("/transponder/all"),
};

// Record entities
export const aiRecordApi = {
  getAll: () => api.get<ServerRes<AiRecord[]>>("/ai-record/all"),
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
};

export const calfStatusApi = {
  getAll: () => api.get<ServerRes<CalfStatus[]>>("/calf-status/all"),
};

export const colorApi = {
  getAll: () => api.get<ServerRes<Color[]>>("/color/all"),
};

export const cowGenderApi = {
  getAll: () => api.get<ServerRes<CowGender[]>>("/cow-gender/all"),
};

export const cowRoleApi = {
  getAll: () => api.get<ServerRes<CowRole[]>>("/cow-role/all"),
};

export const cowStatusApi = {
  getAll: () => api.get<ServerRes<CowStatus[]>>("/cow-status/all"),
};

export const pdStatusApi = {
  getAll: () => api.get<ServerRes<PdStatus[]>>("/pd-status/all"),
};

// Users
export const userApi = {
  getAll: () => api.get<ServerRes<User[]>>("/user/all"),
};

export default api;
