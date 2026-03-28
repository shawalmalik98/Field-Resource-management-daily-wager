/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Download, CalendarIcon } from "lucide-react";
import { showSuccessToast } from "@/lib/toaster";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
	cashMemoApi,
	contractorApi,
	getCashMemoFinanceApi,
	zonesApi,
} from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { CashMemoResponse } from "@/lib/apiTypes";

import { Label } from "@/components/ui/label";

import {
	Select,
	SelectItem,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Shift } from "@/lib/schemas";

const columns = [
	{ key: "user", label: "Supervisor" },
	{ key: "zone", label: "Zone" },
	{ key: "contractor", label: "Contractor" },
	{ key: "unionCouncil", label: "Union Council" },
	{ key: "wardNames", label: "Wards" },
	{ key: "paidStatus", label: "Paid Status" },
	{ key: "paidAmount", label: "Paid Amount" },
	{ key: "pendingAmount", label: "Pending Amount" },
	{ key: "totalAmount", label: "Total Amount" },
	{ key: "shift", label: "Shift" },
	{ key: "totalWorkers", label: "Total Workers" },
	{ key: "deployDate", label: "Deploy Date" },
	{ key: "createdAt", label: "Date & Time" },
];

const csvColumns = [
	{ key: "id", label: "ID" },
	{ key: "contractor", label: "Contractor" },
	{ key: "shift", label: "Shift" },
	{ key: "user", label: "Supervisor" },
	{ key: "zone", label: "Zone" },
	{ key: "videoUrl", label: "Video" },
	{ key: "unionCouncil", label: "Union Council" },
	{ key: "totalWorkers", label: "Total Workers" },
	{ key: "wardWithWorkers", label: "Ward With Workers" },
	{ key: "wards", label: "Wards" },
	{ key: "paidStatus", label: "Paid Status" },
	{ key: "paidAmount", label: "Paid Amount" },
	{ key: "pendingAmount", label: "Pending Amount" },
	{ key: "totalAmount", label: "Total Amount" },
	{ key: "deployDate", label: "Deploy Date" },
	{ key: "createdAt", label: "Date & Time" },
];

const ledgerColumns = [
	{ key: "id", label: "ID" },
	{ key: "supervisor", label: "Supervisor" },
	{ key: "debit", label: "Debit" },
	{ key: "credit", label: "Credit" },
	{ key: "remaining", label: "Remaining" },
];

const SHIFT_OPTIONS = [
	{ id: Shift.MORNING, name: "Morning" },
	{ id: Shift.NIGHT, name: "Night" },
	{ id: Shift.EVENING, name: "Evening" },
];

const ReportsPage = () => {
	const { data: contractorsData, isLoading: isContractorsLoading } = useQuery(
		{
			queryKey: ["contractors"],
			queryFn: () => contractorApi(),
		}
	);

	const {
		data: zones,
		isLoading: isZonesLoading,
		isError: isZonesError,
	} = useQuery({
		queryKey: ["zones"],
		queryFn: zonesApi,
	});

	const {
		data: cashMemos,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["cashMemos"],
		queryFn: () => cashMemoApi(true),
		enabled: !isContractorsLoading && !isZonesLoading,
	});

	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [search, setSearch] = useState("");

	const [selectedContractor, setSelectedContractor] = useState<number>(0);
	const [selectedZone, setSelectedZone] = useState<number>(0);
	const [selectedShift, setSelectedShift] = useState<Shift | "ALL">("ALL");
	const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
		"PAID" | "PENDING" | "ALL"
	>("ALL");

	const getFilteredData = () => {
		if (!startDate && !endDate) return cashMemos;

		return cashMemos?.filter((memo) => {
			const memoDate = new Date(memo.createdAt);

			const start = startDate
				? new Date(new Date(startDate).setHours(0, 0, 0, 0))
				: null;
			const end = endDate
				? new Date(new Date(endDate).setHours(23, 59, 59, 999))
				: null;

			if (start && end) {
				return memoDate >= start && memoDate <= end;
			} else if (start) {
				return memoDate >= start;
			} else if (end) {
				return memoDate <= end;
			}

			return true;
		});
	};

	const getFilteredDataByContractor = () => {
		if (
			selectedContractor === 0 &&
			selectedShift === "ALL" &&
			selectedZone === 0 &&
			selectedPaymentStatus === "ALL"
		) {
			return getFilteredData();
		}

		let newData: CashMemoResponse[] | null | undefined = getFilteredData();

		if (selectedContractor !== 0) {
			newData = getFilteredData()?.filter(
				(memo) => memo.contractorId === selectedContractor
			);
		}

		if (selectedShift !== "ALL") {
			newData = newData?.filter((memo) => memo.shift === selectedShift);
		}

		if (selectedZone !== 0) {
			newData = newData?.filter((memo) => memo.zoneId === selectedZone);
		}

		if (selectedPaymentStatus !== "ALL") {
			newData = newData?.filter(
				(memo) => memo.paidStatus === selectedPaymentStatus
			);
		}

		return newData;
	};

	const filteredData = getFilteredDataByContractor()?.filter((item) =>
		Object.values(item).some((value) =>
			String(value).toLowerCase().includes(search.toLowerCase())
		)
	);

	const downloadLedger = async (supervisorId: number) => {
		const financeData = await getCashMemoFinanceApi(supervisorId);
		console.log("financeData", financeData);

		const csvContent = convertToCSV(financeData ?? [], true);
		downloadCSV(csvContent, `ledger-${supervisorId}.csv`);
		showSuccessToast("Ledger exported successfully");
	};

	const handleExportCSV = () => {
		const allFilterIds = filteredData?.map((item) => item.id) ?? [];
		const allData: any[] = [];

		filteredData?.forEach((item) => {
			if (allFilterIds.includes(item.id)) {
				const data = {
					...item,
					wards: item.wardNames.join(", "),
				};
				allData.push(data);
			}
		});

		const csvContent = convertToCSV(allData ?? []);
		downloadCSV(
			csvContent,
			`report-${format(new Date(), "yyyy-MM-dd")}.csv`
		);
		showSuccessToast("CSV exported successfully");
	};
	const convertToCSV = (data: any[], isLedger?: boolean) => {
		const column = isLedger ? ledgerColumns : csvColumns;

		const headers = column.map((col) => col.label).join(",");
		const rows = data.map((row) =>
			isLedger
				? column.map((col) => `"${row[col.key]}"`).join(",")
				: csvColumns
						.map((col) => {
							if (col.key === "wardWithWorkers") {
								const wardWithWorkers = row.cashMemoWards.map(
									(ward: any) =>
										`${ward.ward.name} = Single Workers: (${ward.singleWorkers}) Double Workers: (${ward.doubleWorkers}) Labour Deducted: (${ward.labourDeducted})`
								);

								return `"${wardWithWorkers.join("\n")}"`;
							}
							return `"${row[col.key]}"`;
						})
						.join(",")
		);
		return [headers, ...rows].join("\n");
	};

	const downloadCSV = (content: string, filename: string) => {
		const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		if (link.download !== undefined) {
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	if (isLoading || isZonesLoading) return <ApiLoading />;
	if (isError || isZonesError) return <ApiError />;

	return (
		<div className="space-y-4">
			<div className="flex md:flex-row flex-col gap-2 items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Reports
					</h2>
					<p className="text-muted-foreground">
						View and filter all reports.
					</p>
				</div>
				<div className="flex space-x-2 md:flex-row flex-col gap-2">
					<Button onClick={handleExportCSV} variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			<Card className="border-none ">
				<CardHeader>
					<CardTitle>Reports</CardTitle>
					<CardDescription>View and filter reports.</CardDescription>
				</CardHeader>
				<CardContent className="md:max-w-[80vw] overflow-x-auto">
					{/* Date Filter */}
					<div className="flex flex-col gap-4 py-4 items-center">
						<div className="flex gap-2 md:flex-row flex-col w-full items-center">
							<div className="flex flex-col gap-2 flex-1">
								<Label htmlFor="name" className="text-right">
									Zone
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedZone(Number(val));
									}}
									value={selectedZone.toString()}
								>
									<SelectTrigger className="col-span-3 w-full min-h-12">
										<SelectValue placeholder="Select Contractor" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={"0"}>
											All Zones
										</SelectItem>
										{zones?.map((z) => (
											<SelectItem
												key={z.id}
												value={z.id.toString()}
											>
												{z.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-2 flex-1">
								<Label htmlFor="name" className="text-right">
									Contractor
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedContractor(Number(val));
									}}
									value={selectedContractor.toString()}
								>
									<SelectTrigger className="col-span-3 w-full min-h-12">
										<SelectValue placeholder="Select Contractor" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={"0"}>
											All Contractors
										</SelectItem>
										{contractorsData?.map((c) => (
											<SelectItem
												key={c.id}
												value={c.id.toString()}
											>
												{c.fullName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-2 flex-1">
								<Label htmlFor="name" className="text-right">
									Shift
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedShift(val as Shift | "ALL");
									}}
									value={selectedShift}
								>
									<SelectTrigger className="col-span-3 w-full min-h-12">
										<SelectValue placeholder="Select Contractor" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={"ALL"}>
											All Shifts
										</SelectItem>
										{SHIFT_OPTIONS?.map((s) => (
											<SelectItem key={s.id} value={s.id}>
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="flex flex-col gap-2 flex-1">
								<Label htmlFor="name" className="text-right">
									Payment Status
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedPaymentStatus(
											val as "PAID" | "PENDING" | "ALL"
										);
									}}
									value={selectedPaymentStatus}
								>
									<SelectTrigger className="col-span-3 w-full min-h-12">
										<SelectValue placeholder="Select Payment Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={"ALL"}>
											All
										</SelectItem>
										<SelectItem value={"PAID"}>
											Paid
										</SelectItem>
										<SelectItem value={"PENDING"}>
											Pending
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="flex gap-2 md:flex-row flex-col w-full items-center">
							<div className="flex gap-2 w-full">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"flex-1 justify-start text-left font-normal hover:bg-card-foreground",
												!startDate &&
													"text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{startDate ? (
												format(startDate, "PPP")
											) : (
												<span>Start date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={startDate}
											onSelect={setStartDate}
											initialFocus
											className={cn(
												"p-3 pointer-events-auto"
											)}
										/>
									</PopoverContent>
								</Popover>

								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"flex-1 justify-start text-left font-normal hover:bg-card-foreground",
												!endDate &&
													"text-muted-foreground"
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{endDate ? (
												format(endDate, "PPP")
											) : (
												<span>End date</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0"
										align="start"
									>
										<Calendar
											mode="single"
											selected={endDate}
											onSelect={setEndDate}
											initialFocus
											className={cn(
												"p-3 pointer-events-auto"
											)}
										/>
									</PopoverContent>
								</Popover>
							</div>

							<Button
								variant="outline"
								onClick={() => {
									setStartDate(undefined);
									setEndDate(undefined);
									setSearch("");
									setSelectedContractor(0);
									setSelectedShift("ALL");
									setSelectedZone(0);
								}}
							>
								Clear Filters
							</Button>
						</div>
					</div>

					<DataTable
						data={filteredData ?? []}
						columns={columns}
						title=""
						showActions={false}
						onDownloadLedger={downloadLedger}
					/>
				</CardContent>
			</Card>
		</div>
	);
};

export default ReportsPage;
