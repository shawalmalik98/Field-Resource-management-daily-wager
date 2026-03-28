/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	AttendanceResponse,
	CashMemoFinanceResponse,
	CashMemoResponse,
	ContractorsResponse,
	DashboardResponse,
	DepartmentResponse,
	DesignationResponse,
	EmployeeResponse,
	LocationResponse,
	LoginResponse,
	RolesPermissionsResponse,
	SupervisorResponse,
	UCWardsResponse,
	WardsType,
	ZonesHeirarchyResponse,
	ZonesResponse,
} from "./apiTypes";
import axiosInstance from "./axiosInstance";
import { ROUTES } from "./routes";
import { showApiErrorToast, showSuccessToast } from "./toaster";
import { UserType } from "./types";

// apis

export const loginUserApi = async (
	email: string,
	password: string
): Promise<LoginResponse | null> => {
	try {
		const res = await axiosInstance.post<{ data: LoginResponse }>(
			ROUTES.LOGIN,
			{ email, password }
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const forgetPasswordApi = async (email: string): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.FORGET_PASSWORD, { email });
		showSuccessToast(
			"Email sent",
			"Please check your email for the reset link"
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const resetPasswordApi = async (
	id: number,
	password: string
): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.RESET_PASSWORD, { id, password });
		showSuccessToast("Password reset successfully");
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const dashboardApi = async (): Promise<DashboardResponse | null> => {
	try {
		const res = await axiosInstance.get<{ data: DashboardResponse }>(
			ROUTES.GET_DASHBOARD
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

// Department APIs

export const departmentApi = async (): Promise<DepartmentResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: DepartmentResponse[] }>(
			ROUTES.GET_DEPARTMENTS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addDepartmentApi = async (department: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_DEPARTMENTS, department);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateDepartmentApi = async (
	id: number,
	department: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_DEPARTMENT_BY_ID}/${id}`,
			department
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteDepartmentApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_DEPARTMENT_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Designation APIs

export const designationApi = async (): Promise<
	DesignationResponse[] | null
> => {
	try {
		const res = await axiosInstance.get<{ data: DesignationResponse[] }>(
			ROUTES.GET_DESIGNATIONS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addDesignationApi = async (designation: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_DESIGNATIONS, designation);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateDesignationApi = async (
	id: number,
	designation: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_DESIGNATION_BY_ID}/${id}`,
			designation
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteDesignationApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_DESIGNATION_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Contractor APIs

export const contractorApi = async (): Promise<
	ContractorsResponse[] | null
> => {
	try {
		const res = await axiosInstance.get<{ data: ContractorsResponse[] }>(
			ROUTES.GET_CONTRACTORS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addContractorApi = async (contractor: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_CONTRACTORS, contractor);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateContractorApi = async (
	id: number,
	contractor: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_CONTRACTOR_BY_ID}/${id}`,
			contractor
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// UC and Wards APIs

export const ucWardsApi = async (): Promise<UCWardsResponse | null> => {
	try {
		const res = await axiosInstance.get<{ data: UCWardsResponse }>(
			ROUTES.GET_ZONES_UC_WARDS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const ucApi = async (): Promise<WardsType[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: WardsType[] }>(
			ROUTES.GET_ZONES_UCS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addUcApi = async (uc: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_NEW_UC, uc);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const addWardApi = async (ward: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_NEW_WARD, ward);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateUcApi = async (id: number, uc: any): Promise<boolean> => {
	try {
		await axiosInstance.put(`${ROUTES.UPDATE_UC_BY_ID}/${id}`, uc);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateWardApi = async (
	id: number,
	ward: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(`${ROUTES.UPDATE_WARD_BY_ID}/${id}`, ward);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteUcApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_UC_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteWardApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_WARD_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};
// Zone APIs

export const zonesApi = async (): Promise<ZonesResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: ZonesResponse[] }>(
			ROUTES.GET_ZONES
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const createZoneApi = async (zone: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_ZONES, zone);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateZoneApi = async (
	id: number,
	zone: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(`${ROUTES.UPDATE_ZONE_BY_ID}/${id}`, zone);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteZoneApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_ZONE_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Attendance APIs

export const getAttendanceApi = async (): Promise<
	AttendanceResponse[] | null
> => {
	try {
		const res = await axiosInstance.get<{ data: AttendanceResponse[] }>(
			ROUTES.GET_ATTENDANCE
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

// Location APIs

export const locationApi = async (): Promise<LocationResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: LocationResponse[] }>(
			ROUTES.GET_LOCATIONS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addLocationApi = async (location: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_LOCATIONS, location);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateLocationApi = async (
	id: number,
	location: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_LOCATION_BY_ID}/${id}`,
			location
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const deleteLocationApi = async (id: number): Promise<boolean> => {
	try {
		await axiosInstance.delete(`${ROUTES.DELETE_LOCATION_BY_ID}/${id}`);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Employee APIs

export const employeeApi = async (): Promise<EmployeeResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: EmployeeResponse[] }>(
			ROUTES.GET_EMPLOYEES
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addEmployeeApi = async (employee: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_EMPLOYEES, employee);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateEmployeeApi = async (
	id: number,
	employee: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_EMPLOYEE_BY_ID}/${id}`,
			employee
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Supervisor APIs

export const supervisorApi = async (): Promise<SupervisorResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: SupervisorResponse[] }>(
			ROUTES.GET_SUPERVISORS
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const addSupervisorApi = async (supervisor: any): Promise<boolean> => {
	try {
		await axiosInstance.post(ROUTES.CREATE_SUPERVISORS, supervisor);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateSupervisorApi = async (
	id: number,
	supervisor: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_SUPERVISOR_BY_ID}/${id}`,
			supervisor
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// Zones Heirarcy

export const zonesHeirarchyApi = async (): Promise<
	ZonesHeirarchyResponse[] | null
> => {
	try {
		const res = await axiosInstance.get<{ data: ZonesHeirarchyResponse[] }>(
			ROUTES.GET_ZONES_HIERARCHY
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

// User APIs

export const userDetailsApi = async (): Promise<UserType | boolean> => {
	try {
		const res = await axiosInstance.get<{ data: UserType }>(
			ROUTES.GET_USER_DETAILS
		);

		const user: UserType = res.data.data;
		if (res.status === 401) {
			return false;
		}

		if (user.isActive == false) {
			return false;
		}

		return user;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

// cash memo APIs

export const cashMemoApi = async (
	payments?: boolean
): Promise<CashMemoResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{ data: CashMemoResponse[] }>(
			`${ROUTES.GET_CASH_MEMO}${payments ? `?payments=${payments}` : ""}`
		);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const updateCashMemoApi = async (
	id: number,
	data: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(`${ROUTES.UPDATE_CASH_MEMO_BY_ID}/${id}`, data);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const updateCashMemoStatusApi = async (
	id: number,
	data: any
): Promise<boolean> => {
	try {
		await axiosInstance.put(
			`${ROUTES.UPDATE_CASH_MEMO_STATUS}/${id}`,
			data
		);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};

export const getCashMemoFinanceApi = async (
	id: number
): Promise<CashMemoFinanceResponse[] | null> => {
	try {
		const res = await axiosInstance.get<{
			data: CashMemoFinanceResponse[];
		}>(`${ROUTES.GET_CASH_MEMO_FINANCE}/${id}`);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const getAllRolesPermissionsApi = async (): Promise<
	RolesPermissionsResponse[] | null
> => {
	try {
		const res = await axiosInstance.get<{
			data: RolesPermissionsResponse[];
		}>(`${ROUTES.GET_ALL_ROLES_PERMISSIONS}`);
		return res.data.data;
	} catch (error) {
		showApiErrorToast(error);
		return null;
	}
};

export const updateRolesPermissionsApi = async (
	data: RolesPermissionsResponse
): Promise<boolean> => {
	try {
		await axiosInstance.put(ROUTES.UPDATE_ROLES_PERMISSIONS, data);
		return true;
	} catch (error) {
		showApiErrorToast(error);
		return false;
	}
};
