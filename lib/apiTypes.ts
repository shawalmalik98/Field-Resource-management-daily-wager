import { RoleType } from "./types";

// types
export type LoginResponse = {
	token: string;
};

export type DashboardResponse = {
	totalEmployees: number;
	totalSupervisors: number;
	totalZones: number;
	totalCash: number;
	cashMemoData: {
		hour: string;
		cash: number;
	}[];
	mapData: {
		title: string;
		longitude: string;
		latitude: string;
	}[];
};

export type DepartmentResponse = {
	id: number;
	name: string;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
};

export type DesignationResponse = {
	id: number;
	name: string;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	departments: {
		id: number;
		name: string;
	}[];
};

type ZoneSummary = {
	id: number;
	name: string;
	isDeleted: boolean;
};

type Contractor = {
	id: number;
	fullName: string;
	cnicNumber: string;
	contactNumber: string;
	address: string;
	morningPrice: number;
	nightPrice: number;
	eveningPrice: number;
	isActive: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	zones: ZoneSummary[];
};

export type ContractorsResponse = Contractor;

export type WardsType = {
	id: number;
	name: string;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
};

type Summary = {
	id: number;
	name: string;
};

export type unionCouncilType = {
	id: number;
	name: string;
	wards: Summary[];
};

export type UCWardsResponse = {
	ucs: unionCouncilType[];
	wards: WardsType[];
};
export type WardResponse = WardsType[];

export type ZonesResponse = {
	id: number;
	name: string;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	unionCouncils: Summary[];
};

export type AttendanceResponse = {
	supervisor: string;
	id: number;
	createdAt: Date;
	updatedAt: Date;
	totalWorkers: number;
	supervisorId: number;
};

export type LocationResponse = {
	id: number;
	name: string;
	longitude: string;
	latitude: string;
	radius: number;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
};

export type EmployeeResponse = {
	id: number;
	name: string;
	fatherName: string | null;
	email: string | null;
	cnic: string | null;
	contactNo: string | null;
	joiningDate: Date | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	zone: ZoneSummary;
	department: ZoneSummary;
	designation: ZoneSummary;
	user: {
		id: number;
		email: string;
	};
};

export type SupervisorResponse = {
	id: number;
	fullName: string;
	cnicNumber: string;
	contactNumber: string;
	address: string;
	isActive: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	zoneName: string;
	zoneId: number;
	ucs: ZoneSummary[];
	wards: ZoneSummary[];
	location: ZoneSummary[];
	email: string;
	galleryOpen: boolean;
};

type UCHeirarchy = {
	id: number;
	name: string;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	wards: WardsType[];
};

export type ZonesHeirarchyResponse = {
	id: number;
	name: string;
	singleBeat: number;
	doubleBeat: number;
	isDeleted: boolean;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	unionCouncils: UCHeirarchy[];
};

export type CashMemoStatusType =
	| "PENDING"
	| "APPROVE_BY_HR"
	| "APPROVE_BY_HR_MANAGER"
	| "REJECT_BY_HR"
	| "REJECT_BY_HR_MANAGER"
	| "DONE";

export type CashMemoWardType = {
	id: number;
	cashMemoId: number;
	wardId: number;
	singleWorkers: number;
	doubleWorkers: number;
	labourDeducted: number;
	ward: Summary;
};

export type CashMemoResponse = {
	id: number;
	videoUrl: string;
	shift: "MORNING" | "EVENING" | "NIGHT"; // Add other possible values if any
	deployDate: string; // ISO date string
	status: CashMemoStatusType; // Extend with other statuses if needed
	totalAmount: number;
	contractorId: number;
	zoneId: number;
	unionCouncilId: number;
	supervisorId: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	cashMemoHistory: string[];
	zone: string;
	user: string;
	workers: string;
	wards: Summary[];
	unionCouncil: string;
	wardNames: string[];
	totalWorkers: number;
	cashMemoWards: CashMemoWardType[];
	shiftRate: number;
	contractor: string;
	paidStatus: "PAID" | "PENDING" | "N/A";
	paidAmount: number;
	pendingAmount: number;
};

export type CashMemoFinanceResponse = {
	id: number;
	debit: number;
	credit: number;
	remaining: number;
	supervisor: string;
};

export type RolesPermissionsResponse = {
	dashboard: boolean;
	supervisor: boolean;
	contractor: boolean;
	depdes: boolean;
	employee: boolean;
	attendance: boolean;
	location: boolean;
	ucWard: boolean;
	zone: boolean;
	cashMemo: boolean;
	reports: boolean;
	role: RoleType;
	id: number;
	createdAt: Date;
	updatedAt: Date;
};
