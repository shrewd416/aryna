// Data types matching your database schema
export interface User {
  userID: number;
  userName: string;
  mobileNumber: string;
  password: string;
  confirmPassword?: string;
}

export interface UserMaster {
  userID: number;
  userName: string;
  mobileNumber: string;
}

export interface EmployeeMaster {
  mastCode: number;
  userID: number;
  empID: string;
  empName: string;
  designation: string;
  department: string;
  joinedDate: string;
  salary: number;
}

export interface EmployeeDetail {
  empCode: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
}

export interface EmployeeFullRecord extends EmployeeMaster {
  employeeDetail?: EmployeeDetail;
  userName?: string;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface ForgotPasswordRequest {
  userName: string;
  mobileNumber: string;
}

export interface ResetPasswordRequest {
  userName: string;
  newPassword: string;
  confirmPassword: string;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SearchFilters {
  empID?: string;
  empName?: string;
  designation?: string;
  department?: string;
}