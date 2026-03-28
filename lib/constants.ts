import {
	AttendanceRecord,
	ContractorType,
	DepartmentType,
	DesignationType,
	EmployeeType,
	SupervisorType,
} from "./types";
import { Users, MapPin, Zap, AwardIcon } from "lucide-react";

export const BACKEND_URL =
	process.env.NODE_ENV == "development"
		? "http://localhost:5000"
		: "https://back.aysisdailywager.com";

// Location data
export const locationsData = [
	{
		id: "1",
		name: "Downtown",
		longitude: "73.9857",
		latitude: "40.7484",
		radius: 100,
	},
	{
		id: "2",
		name: "Uptown",
		longitude: "73.9625",
		latitude: "40.7769",
		radius: 50,
	},
];

// Initial supervisors data
export const initialSupervisorsData = [
	{
		id: "728ed52f",
		name: "John Smith",
		uc: "UC001",
		locationName: "Downtown",
	},
	{
		id: "39543f14",
		name: "Alice Johnson",
		uc: "UC002",
		locationName: "Uptown",
	},
	{
		id: "b3669734",
		name: "Bob Wilson",
		uc: "UC003",
		locationName: "Downtown",
	},
];

// Navigation items for dashboard layout
export const navigationItems = [
	{ name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
	{ name: "Supervisors", href: "/supervisors", icon: "UserCheck" },
	{ name: "Employees", href: "/employees", icon: "Users" },
	{ name: "Locations", href: "/locations", icon: "MapPin" },
	{ name: "Zones", href: "/zones", icon: "Map" },
	{ name: "Cash Memo", href: "/cash-memo", icon: "Receipt" },
];

// Chart data for dashboard
export const chartData = [
	{ month: "Jan", value: 65 },
	{ month: "Feb", value: 78 },
	{ month: "Mar", value: 90 },
	{ month: "Apr", value: 81 },
	{ month: "May", value: 95 },
	{ month: "Jun", value: 88 },
	{ month: "Jul", value: 102 },
	{ month: "Aug", value: 96 },
	{ month: "Sep", value: 87 },
	{ month: "Oct", value: 93 },
	{ month: "Nov", value: 85 },
	{ month: "Dec", value: 92 },
];

// Sample data
export const zones = [
	{ id: "1", name: "Zone A" },
	{ id: "2", name: "Zone B" },
	{ id: "3", name: "Zone C" },
];

export const unionCouncils = [
	{ id: "1", name: "UC-1" },
	{ id: "2", name: "UC-2" },
	{ id: "3", name: "UC-3" },
	{ id: "4", name: "UC-4" },
];

export const wards = [
	{ id: "1", name: "Ward 1" },
	{ id: "2", name: "Ward 2" },
	{ id: "3", name: "Ward 3" },
	{ id: "4", name: "Ward 4" },
];

export const locations = [
	{ id: "1", name: "Location A" },
	{ id: "2", name: "Location B" },
	{ id: "3", name: "Location C" },
	{ id: "4", name: "Location D" },
];

// Sample supervisors data
export const sampleSupervisors: SupervisorType[] = [
	{
		id: "1",
		fullName: "Ahmed Ali",
		cnicNumber: "12345-6789012-3",
		contactNumber: "03001234567",
		address: "123 Main Street, Karachi",
		zone: "Zone A",
		unionCouncils: ["UC-1", "UC-2"],
		wards: ["Ward 1", "Ward 2"],
		locations: ["Location A", "Location B"],
	},
	{
		id: "2",
		fullName: "Sara Khan",
		cnicNumber: "98765-4321098-7",
		contactNumber: "03019876543",
		address: "456 Park Avenue, Lahore",
		zone: "Zone B",
		unionCouncils: ["UC-3"],
		wards: ["Ward 3", "Ward 4"],
		locations: ["Location C"],
	},
	{
		id: "3",
		fullName: "Muhammad Hassan",
		cnicNumber: "11111-2222233-4",
		contactNumber: "03051111222",
		address: "789 Garden Road, Islamabad",
		zone: "Zone C",
		unionCouncils: ["UC-1", "UC-4"],
		wards: ["Ward 1"],
		locations: ["Location A", "Location D"],
	},
];

export const initialContractorsData: ContractorType[] = [
	{
		id: "cont-1",
		fullName: "Ahmed Ali",
		cnicNumber: "1234567890123",
		zone: "Zone A",
		contactNumber: "03001234567",
		address: "123 Main Street, City",
		morningPrice: 500,
		afternoonPrice: 600,
		eveningPrice: 700,
	},
	{
		id: "cont-2",
		fullName: "Muhammad Hassan",
		cnicNumber: "9876543210987",
		zone: "Zone B",
		contactNumber: "03009876543",
		address: "456 Oak Avenue, Town",
		morningPrice: 550,
		afternoonPrice: 650,
		eveningPrice: 750,
	},
];

export const initialDepartments: DepartmentType[] = [
	{ id: "dept-1", name: "Human Resources" },
	{ id: "dept-2", name: "Engineering" },
	{ id: "dept-3", name: "Operations" },
];

export const initialDesignations: DesignationType[] = [
	{ id: "des-1", name: "Manager", departmentIds: ["dept-1", "dept-2"] },
	{ id: "des-2", name: "Developer", departmentIds: ["dept-2"] },
	{ id: "des-3", name: "Operator", departmentIds: ["dept-3"] },
];

export const initialEmployeesData: EmployeeType[] = [
	{
		id: "728ed52f",
		name: "Lesly Cristobal",
		fatherName: "John Cristobal",
		cnic: "1234567890123",
		contactNo: "03001234567",
		designation: "Manager",
		department: "Human Resources",
		joiningDate: new Date("2023-01-15"),
		zone: "Zone A",
	},
	{
		id: "39543f14",
		name: "Bradford Swift",
		fatherName: "Robert Swift",
		cnic: "9876543210987",
		contactNo: "03009876543",
		designation: "Developer",
		department: "Engineering",
		joiningDate: new Date("2023-03-20"),
		zone: "Zone B",
	},
];

export const attendanceData: AttendanceRecord[] = [
	{
		id: "1",
		supervisorName: "John Doe",
		totalWorkers: 25,
		attendance: "Present",
		date: new Date(),
	},
	{
		id: "2",
		supervisorName: "Jane Smith",
		totalWorkers: 30,
		attendance: "Present",
		date: new Date(),
	},
	{
		id: "3",
		supervisorName: "Mike Johnson",
		totalWorkers: 20,
		attendance: "Present",
		date: new Date(Date.now() - 86400000), // Yesterday
	},
];

export const initialZones = [
	{
		id: "zone-1",
		name: "Zone A",
		ucNames: ["UC-1 Central", "UC-2 North"],
		singleBeatPrice: 50,
		doubleBeatPrice: 90,
	},
	{
		id: "zone-2",
		name: "Zone B",
		ucNames: ["UC-2 North"],
		singleBeatPrice: 60,
		doubleBeatPrice: 110,
	},
	{
		id: "zone-3",
		name: "Zone C",
		ucNames: ["UC-3 South", "UC-4 East"],
		singleBeatPrice: 70,
		doubleBeatPrice: 130,
	},
];

export const mockCashMemos = [
	{
		id: 1,
		zone: "Zone A",
		dateTime: "2024-01-15 10:30 AM",
		beatType: "Single",
		workers: 5,
		price: "$500",
		video: "video1.mp4",
		status: "Reject",
		history: ["Edit By HR: Shawal", "Reject By HR Head: Noman"],
	},
	{
		id: 2,
		zone: "Zone B",
		dateTime: "2024-01-15 2:45 PM",
		beatType: "Double",
		workers: 8,
		price: "$1600",
		video: "video2.mp4",
		status: "Accept",
		history: ["Accept By HR: Shawal", "Accept By HR Head: Noman"],
	},
	{
		id: 3,
		zone: "Zone C",
		dateTime: "2024-01-15 10:30 AM",
		beatType: "Single",
		workers: 5,
		price: "$500",
		video: "video1.mp4",
		status: "Pending",
		history: [],
	},
];

export const summaryData = [
	{
		id: 1,
		title: "Total Cash",
		icon: AwardIcon,
		description: "",
	},
	{
		id: 2,
		title: "Number of Supervisors",
		icon: Users,
		description: "",
	},
	{
		id: 3,
		title: "Number of Zones",
		icon: MapPin,
		description: "",
	},
	{
		id: 4,
		title: "Total Employees",
		icon: Zap,
		description: "",
	},
];

export const dashboardChartData = [
	{ hour: "9AM", cash: 1200 },
	{ hour: "10AM", cash: 1800 },
	{ hour: "11AM", cash: 2400 },
	{ hour: "12PM", cash: 3200 },
	{ hour: "1PM", cash: 2800 },
	{ hour: "2PM", cash: 3600 },
	{ hour: "3PM", cash: 4100 },
	{ hour: "4PM", cash: 3800 },
	{ hour: "5PM", cash: 4500 },
];

export const roles = [
	"EMPLOYEE",
	"HR_INSPECTOR",
	"HR_MANAGER",
	"FINANCE",
	"SUPERVISOR",
	"CONTRACTOR",
];

export const logoBase64 =
	"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";
