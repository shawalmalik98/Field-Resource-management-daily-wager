export type MultiSelectOption = {
	id: string;
	name: string;
};

export type SupervisorType = {
	id: string;
	fullName: string;
	cnicNumber: string;
	contactNumber: string;
	address: string;
	zone: string;
	unionCouncils: string[];
	wards: string[];
	locations: string[];
};

export type ContractorType = {
	id: string;
	fullName: string;
	cnicNumber: string;
	zone: string;
	contactNumber: string;
	address: string;
	morningPrice: number;
	afternoonPrice: number;
	eveningPrice: number;
};

export type DepartmentType = {
	id: string;
	name: string;
};

export type DesignationType = {
	id: string;
	name: string;
	departmentIds: string[];
};

export type EmployeeType = {
	id: string;
	name: string;
	fatherName: string;
	cnic: string;
	contactNo: string;
	designation: string;
	department: string;
	joiningDate: Date;
	zone: string;
};

export type AttendanceRecord = {
	id: string;
	supervisorName: string;
	totalWorkers: number;
	attendance: string;
	date: Date;
};

export type LocationType = {
	id: string;
	name: string;
	longitude: string;
	latitude: string;
	radius: number;
};

export type UnionCouncilType = {
	id: number;
	name: string;
	wards: number[];
};

export type WardType = {
	id: number;
	name: string;
};

export type PagesType = {
	id: number;
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
	createdAt: Date;
	updatedAt: Date;
};

export type RoleType =
	| "SUPER_ADMIN"
	| "ADMIN"
	| "EMPLOYEE"
	| "HR_INSPECTOR"
	| "HR_MANAGER"
	| "FINANCE"
	| "SUPERVISOR"
	| "CONTRACTOR";

export type UserType = {
	id: string;
	email: string;
	role: RoleType;
	name: string;
	isActive: boolean;
	pages: PagesType | null;
};
