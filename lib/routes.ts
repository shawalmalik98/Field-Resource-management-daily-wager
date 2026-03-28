export const ROUTES = {
	// Public Routes
	LOGIN: "/pub/login/",
	FORGET_PASSWORD: "/pub/login/forget-password",
	RESET_PASSWORD: "/pub/login/reset-password",

	// Supervisors
	GET_SUPERVISORS: "/user/supervisors",
	CREATE_SUPERVISORS: "/user/supervisors",
	UPDATE_SUPERVISOR_BY_ID: "/user/supervisors",

	// Employees
	GET_EMPLOYEES: "/user/employees",
	CREATE_EMPLOYEES: "/user/employees",
	UPDATE_EMPLOYEE_BY_ID: "/user/employees",

	// Contractors
	GET_CONTRACTORS: "/user/contractors",
	CREATE_CONTRACTORS: "/user/contractors",
	UPDATE_CONTRACTOR_BY_ID: "/user/contractors",
	DELETE_CONTRACTOR_BY_ID: "/user/contractors",

	// Zones
	GET_ZONES: "/zones",
	CREATE_ZONES: "/zones",
	UPDATE_ZONE_BY_ID: "/zones",
	DELETE_ZONE_BY_ID: "/zones",
	GET_ZONES_UC_WARDS: "/zones/uc-wards",
	GET_ZONES_UCS: "/zones/ucs",
	GET_ZONES_HIERARCHY: "/zones/hierarchy",
	GET_ZONES_WARDS: "/zones/wards",
	CREATE_NEW_UC: "/zones/newUC",
	CREATE_NEW_WARD: "/zones/newWard",
	UPDATE_UC_BY_ID: "/zones/uc",
	UPDATE_WARD_BY_ID: "/zones/ward",
	DELETE_UC_BY_ID: "/zones/uc",
	DELETE_WARD_BY_ID: "/zones/ward",

	// Attendance
	GET_ATTENDANCE: "/common/attendance",
	CREATE_ATTENDANCE: "/common/attendance",

	// Locations
	GET_LOCATIONS: "/common/locations",
	CREATE_LOCATIONS: "/common/locations",
	UPDATE_LOCATION_BY_ID: "/common/locations",
	DELETE_LOCATION_BY_ID: "/common/locations",

	// Departments
	GET_DEPARTMENTS: "/common/departments",
	CREATE_DEPARTMENTS: "/common/departments",
	UPDATE_DEPARTMENT_BY_ID: "/common/departments",
	DELETE_DEPARTMENT_BY_ID: "/common/departments",

	// Designations
	GET_DESIGNATIONS: "/common/designations",
	CREATE_DESIGNATIONS: "/common/designations",
	UPDATE_DESIGNATION_BY_ID: "/common/designations",
	DELETE_DESIGNATION_BY_ID: "/common/designations",

	// Dashboard
	GET_DASHBOARD: "/common/dashboard",

	// User
	GET_USER_DETAILS: "/user/details",

	// Cash Memo
	GET_CASH_MEMO: "/cashMemo",
	CREATE_CASH_MEMO: "/cashMemo/addMemo",
	UPDATE_CASH_MEMO_BY_ID: "/cashMemo/update",
	UPDATE_CASH_MEMO_STATUS: "/cashMemo/updateStatus",
	ADD_VIDEO: "/cashMemo/addVideo",
	GET_CASH_MEMO_FINANCE: "/cashMemo/finance",
	GET_ALL_ROLES_PERMISSIONS: "/user/roles-permissions",
	UPDATE_ROLES_PERMISSIONS: "/user/roles-permissions",
} as const;
