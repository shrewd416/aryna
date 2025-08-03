// src/services/api.ts
import { 
    LoginCredentials, 
    User, 
    ApiResponse, 
    ForgotPasswordRequest, 
    ResetPasswordRequest,
    EmployeeFullRecord,
    SearchFilters
} from '@/types';
import AuthUtils from '@/utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
    throw new Error("VITE_API_URL is not defined. Please check your .env files.");
}

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AuthUtils.getToken()}`
});


const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
};

const apiService = {
    // Auth
    login: (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
        return fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        }).then(handleResponse);
    },

    register: (userData: User): Promise<ApiResponse> => {
        return fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }).then(handleResponse);
    },

    forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<{ token: string }>> => {
        return fetch(`${API_BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse);
    },
    
    // UPDATED resetPassword
    resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse> => {
        // The token is now inside the data object
        return fetch(`${API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse);
    },

    // NEW Profile methods
    updateUsername: (newUserName: string): Promise<ApiResponse<User>> => {
        return fetch(`${API_BASE_URL}/profile/username`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ newUserName }),
        }).then(handleResponse);
    },

    changePassword: (passwordData: object): Promise<ApiResponse> => {
        return fetch(`${API_BASE_URL}/profile/password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(passwordData),
        }).then(handleResponse);
    },
    
    logout: (): Promise<ApiResponse> => {
        // Client-side token removal is primary, this is for completion
        return Promise.resolve({ success: true, message: "Logged out" });
    },

    // Employees
    getAllEmployees: (searchTerm?: string): Promise<ApiResponse<EmployeeFullRecord[]>> => {
        const url = searchTerm ? `${API_BASE_URL}/employees?q=${searchTerm}` : `${API_BASE_URL}/employees`;
        return fetch(url, { headers: getAuthHeaders() }).then(handleResponse);
    },

    getEmployeeById: (mastCode: number): Promise<ApiResponse<EmployeeFullRecord>> => {
        return fetch(`${API_BASE_URL}/employees/${mastCode}`, { headers: getAuthHeaders() }).then(handleResponse);
    },

    addEmployee: (employeeData: Partial<EmployeeFullRecord>): Promise<ApiResponse> => {
        return fetch(`${API_BASE_URL}/employees`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(employeeData),
        }).then(handleResponse);
    },

    updateEmployee: (mastCode: number, employeeData: Partial<EmployeeFullRecord>): Promise<ApiResponse> => {
        return fetch(`${API_BASE_URL}/employees/${mastCode}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(employeeData),
        }).then(handleResponse);
    },

    deleteEmployee: (mastCode: number): Promise<ApiResponse> => {
        return fetch(`${API_BASE_URL}/employees/${mastCode}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        }).then(handleResponse);
    },
};

export default apiService;