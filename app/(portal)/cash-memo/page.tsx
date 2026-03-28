/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Download, CalendarIcon, X } from "lucide-react";
import { showSuccessToast } from "@/lib/toaster";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	cashMemoApi,
	contractorApi,
	getCashMemoFinanceApi,
	updateCashMemoApi,
	updateCashMemoStatusApi,
	zonesApi,
	zonesHeirarchyApi,
} from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import FormModal from "@/components/FormModal";
import { CashMemoFinanceResponse, CashMemoResponse } from "@/lib/apiTypes";
import { Controller, useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { cashMemoSchema, Shift } from "@/lib/schemas";
import { z } from "zod";
import {
	Select,
	SelectItem,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { MultiSelectOption } from "@/lib/types";
import MultiSelect from "@/components/MultiSelect";
import { Badge } from "@/components/ui/badge";
import AlertBox from "@/components/alertBox";
import useUserStore from "@/state/userState";
import { RejectModal } from "@/components/rejectModal";
import FinanceBox from "@/components/financeBox";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { numberToWords } from "@/lib/helper";
import { logoBase64 } from "@/lib/constants";

const columns = [
	{ key: "zone", label: "Zone" },
	{ key: "contractor", label: "Contractor" },
	{ key: "user", label: "Supervisor" },
	{ key: "totalWorkers", label: "Total Workers" },
	{ key: "totalAmount", label: "Price" },
	{ key: "videoUrl", label: "Video" },
	{ key: "status", label: "Status" },
	{ key: "createdAt", label: "Date & Time" },
	{ key: "cashMemoHistory", label: "History" },
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
	{ key: "deployDate", label: "Deploy Date" },
	{ key: "wards", label: "Wards" },
	{ key: "status", label: "Status" },
	{ key: "totalAmount", label: "Total Amount" },
	{ key: "cashMemoHistory", label: "History" },
	{ key: "createdAt", label: "Date & Time" },
];

const SHIFT_OPTIONS = [
	{ id: Shift.MORNING, name: "Morning" },
	{ id: Shift.NIGHT, name: "Night" },
	{ id: Shift.EVENING, name: "Evening" },
];

const CashMemo = () => {
	const { user } = useUserStore();
	const { data: zonesHeirarchyData, isLoading: isZonesLoading } = useQuery({
		queryKey: ["zonesHeirarchy"],
		queryFn: () => zonesHeirarchyApi(),
	});
	const { data: contractorsData, isLoading: isContractorsLoading } = useQuery(
		{
			queryKey: ["contractors"],
			queryFn: () => contractorApi(),
		}
	);

	const { data: zones, isLoading: isOnlyZonesLoading } = useQuery({
		queryKey: ["zones"],
		queryFn: zonesApi,
	});

	const {
		data: cashMemos,
		isLoading,
		isError,
		refetch: refetchCashMemos,
	} = useQuery({
		queryKey: ["cashMemos"],
		queryFn: () => cashMemoApi(),
		enabled:
			!isZonesLoading && !isContractorsLoading && !isOnlyZonesLoading,
	});

	const { mutateAsync: updateCashMemo, isPending: isUpdating } = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: z.infer<typeof cashMemoSchema>;
		}) => updateCashMemoApi(id, data),
	});

	const { mutateAsync: updateCashMemoStatus } = useMutation({
		mutationFn: ({ id, data }: { id: number; data: any }) =>
			updateCashMemoStatusApi(id, data),
	});

	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();
	const [search, setSearch] = useState("");

	const [selectedContractor, setSelectedContractor] = useState<number>(0);
	const [selectedZones, setSelectedZones] = useState<number>(0);
	const [selectedShift, setSelectedShift] = useState<Shift | "ALL">("ALL");

	const [open, setOpen] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [editingItem, setEditingItem] = useState<CashMemoResponse | null>(
		null
	);

	const [isView, setIsView] = useState(false);

	const [showAcceptModal, setShowAcceptModal] = useState({
		show: false,
		id: 0,
	});
	const [showRejectModal, setShowRejectModal] = useState({
		show: false,
		id: 0,
	});
	const [showFinishModal, setShowFinishModal] = useState<{
		show: boolean;
		id: number;
		supervisorId: number;
		data: CashMemoResponse | null;
	}>({
		show: false,
		id: 0,
		supervisorId: 0,
		data: null,
	});

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<z.infer<typeof cashMemoSchema>>({
		resolver: zodResolver(cashMemoSchema),
		defaultValues: {
			zoneId: 0,
			ucId: 0,
			wards: [],
			contractorId: 0,
			shift: Shift.MORNING,
			totalAmount: 0,
			deployDate: new Date(),
			videoUrl: "",
		},
	});

	const selectedZone = watch("zoneId");
	const selectedUnionCouncils = watch("ucId");
	const watchedWards = watch("wards");
	const watchShift = watch("shift");
	const watchContractor = watch("contractorId");

	const handleView = (memo: CashMemoResponse) => {
		reset({
			zoneId: memo.zoneId,
			ucId: memo.unionCouncilId,
			wards: memo.cashMemoWards.map((ward) => ({
				wardId: ward.wardId,
				singleWorkers: ward.singleWorkers,
				doubleWorkers: ward.doubleWorkers,
				labourDeducted: ward.labourDeducted,
				wardName: ward.ward.name,
			})),
			contractorId: memo.contractorId,
			shift: memo.shift as Shift,
			totalAmount: memo.totalAmount,
			deployDate: new Date(memo.deployDate),
			videoUrl: memo.videoUrl,
		});
		setIsView(true);
		setOpen(true);
		// navigate.push(`/cash-memo/view/${memo.id}`);
	};

	const handleEdit = (memo: CashMemoResponse) => {
		setIsView(false);
		setIsEdit(true);
		setEditingItem(memo);
		reset({
			zoneId: memo.zoneId,
			ucId: memo.unionCouncilId,
			wards: memo.cashMemoWards.map((ward) => ({
				id: ward.id,
				wardId: ward.wardId,
				singleWorkers: ward.singleWorkers,
				doubleWorkers: ward.doubleWorkers,
				labourDeducted: ward.labourDeducted,
				wardName: ward.ward.name,
			})),
			contractorId: memo.contractorId,
			shift: memo.shift as Shift,
			totalAmount: memo.totalAmount,
			deployDate: new Date(memo.deployDate),
			videoUrl: memo.videoUrl,
		});
		setOpen(true);
	};

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
			selectedZones === 0
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

		if (selectedZones !== 0) {
			newData = newData?.filter((memo) => memo.zoneId === selectedZones);
		}

		return newData;
	};

	const filteredData = getFilteredDataByContractor()?.filter((item) =>
		Object.values(item).some((value) =>
			String(value).toLowerCase().includes(search.toLowerCase())
		)
	);

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
			`cash-memos-${format(new Date(), "yyyy-MM-dd")}.csv`
		);
		showSuccessToast("CSV exported successfully");
	};
	const convertToCSV = (data: any[]) => {
		const headers = csvColumns.map((col) => col.label).join(",");
		const rows = data.map((row) =>
			csvColumns
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

	const generatePDF = (
		financeData: CashMemoFinanceResponse[],
		payAmount: number
	) => {
		const doc = new jsPDF();

		// Add logo
		doc.addImage(logoBase64, "PNG", 15, 15, 30, 10);

		// doc.setFontSize(12);
		// doc.text("Memo - Internal", 50, 20);

		doc.setFontSize(10);
		doc.text(`Recipient Name: ${financeData[0].supervisor}`, 15, 30);
		doc.text("Business Unit: Finance", 15, 36);
		doc.text("Department: Finance", 15, 42);
		doc.text("Location: KMC", 15, 48);
		doc.text("Date: 29/05/2025", 150, 30);

		doc.setFontSize(12);
		doc.text(
			`Subject: Payment for Labour Deployed on Daily Basis Company Labour (${
				cashMemos?.[0]?.zone ?? ""
			})`,
			15,
			60
		);

		doc.setFontSize(10);
		doc.text(
			`We request the processing of payments for the Aysis labour, engaged in ${
				cashMemos?.[0]?.unionCouncil ?? ""
			} for the deployment of labor on a daily basis.`,
			15,
			70,
			{ maxWidth: 180 }
		);

		const headers = [
			["Date", "Shift", "Zone", "UC", "Ward", "QTY", "Rate", "Amount"],
		];
		const body = [];

		let totalCredit = 0;

		let totalRemainingAmount = financeData?.reduce(
			(sum, cm) => sum + cm.remaining,
			0
		);

		let totalWorkers = 0;
		let labourDeducted = 0;
		financeData.forEach((item) => {
			const cashMemo = cashMemos?.find((cm) => cm.id == item.id);

			if (!cashMemo) return;

			const singleWorkers = cashMemo.cashMemoWards.reduce(
				(sum, ward) => sum + ward.singleWorkers,
				0
			);
			const doubleWorkers = cashMemo.cashMemoWards.reduce(
				(sum, ward) => sum + ward.doubleWorkers,
				0
			);

			labourDeducted += cashMemo.cashMemoWards.reduce(
				(sum, ward) => sum + ward.labourDeducted,
				0
			);
			totalWorkers += cashMemo.cashMemoWards.reduce(
				(sum, ward) => sum + ward.singleWorkers + ward.doubleWorkers,
				0
			);
			totalCredit += item.credit;

			body.push([
				format(cashMemo.deployDate, "dd-MMM-yy"),
				cashMemo.shift,
				cashMemo.zone,
				cashMemo.unionCouncil,
				cashMemo.wardNames.join(", "),
				(singleWorkers ?? 0) + (doubleWorkers ?? 0),
				cashMemo.shiftRate,
				item.credit,
			]);
		});

		// Append TOTAL row manually
		body.push(["", "", "", "", "", totalWorkers, "", totalCredit]);

		autoTable(doc, {
			head: headers,
			body,
			startY: 85,
			theme: "grid",
			styles: {
				fontSize: 10,
				cellPadding: 3,
			},
			columnStyles: {
				5: { halign: "right" }, // QTY
				7: { halign: "right" }, // Amount
			},
		});

		const finalY = (doc as any).lastAutoTable.finalY || 130;
		totalRemainingAmount = totalRemainingAmount - totalCredit;

		// Post-table notes
		doc.text(
			`Excluding Above Data: ${labourDeducted} labour deducted`,
			15,
			finalY + 10
		);

		doc.text(
			`Kindly, pay total amount of Aysis labour – (${
				cashMemos?.[0]?.contractor ?? ""
			})`,
			15,
			finalY + 20
		);
		doc.text(
			`– Amounting “${numberToWords(
				payAmount
			)} (${payAmount}/-)” for provision of ${totalWorkers} labors deployed at ${
				cashMemos?.[0]?.zone ?? ""
			}.`,
			15,
			finalY + 27,
			{ maxWidth: 180 }
		);

		if (totalRemainingAmount > 0) {
			doc.text(
				`– Remaing Amount is “${numberToWords(
					totalRemainingAmount
				)} (${totalRemainingAmount}/-)”.`,
				15,
				finalY + 34,
				{ maxWidth: 180 }
			);
		} else {
			doc.text(`– Remaing Amount is zero rupees (0/-)`, 15, finalY + 34, {
				maxWidth: 180,
			});
		}

		doc.text(
			"If any further information or documentation is required, please let us know.\nThank you for your support and prompt action.",
			15,
			finalY + 47
		);

		doc.save("daily_wager.pdf");
	};

	const getZoneData = () => {
		const data: MultiSelectOption[] = [];
		zonesHeirarchyData?.forEach((zone) => {
			data.push({ id: zone.id.toString(), name: zone.name });
		});
		return data;
	};

	const getUnionCouncilData = () => {
		const data: MultiSelectOption[] = [];

		const sZone = zonesHeirarchyData?.find(
			(zone) => zone.id === selectedZone
		);

		if (sZone) {
			sZone.unionCouncils.forEach((uc) => {
				data.push({ id: uc.id.toString(), name: uc.name });
			});

			return data;
		} else {
			return [];
		}
	};

	const getWardData = () => {
		const data: MultiSelectOption[] = [];

		const sZone = zonesHeirarchyData?.find(
			(zone) => zone.id === selectedZone
		);

		if (sZone) {
			sZone.unionCouncils.forEach((uc) => {
				if (selectedUnionCouncils === uc.id) {
					uc.wards.forEach((ward) => {
						if (
							data.findIndex(
								(w) => w.id === ward.id.toString()
							) === -1
						) {
							data.push({
								id: ward.id.toString(),
								name: ward.name,
							});
						}
					});
				}
			});

			return data;
		} else {
			return [];
		}
	};

	const removeItem = (id: number) => {
		setValue(
			"wards",
			watchedWards.filter((item) => item.wardId !== id)
		);
	};

	const onSubmit = async (data: z.infer<typeof cashMemoSchema>) => {
		if (!editingItem) return;

		const result = await updateCashMemo({
			id: editingItem?.id,
			data: {
				...data,
				totalAmount: calculatePrice(),
			},
		});

		if (result) {
			showSuccessToast("Cash memo updated successfully");
			reset();
			setEditingItem(null);
			setOpen(false);
			refetchCashMemos();
		}
	};

	const acceptStatusUpdate = async (id: number) => {
		const newData = {
			status:
				user?.role == "HR_INSPECTOR"
					? "APPROVE_BY_HR"
					: user?.role == "HR_MANAGER"
					? "APPROVE_BY_HR_MANAGER"
					: "",
		};

		if (newData.status == "") return;

		const result = await updateCashMemoStatus({
			id,
			data: newData,
		});

		if (result) {
			showSuccessToast("Cash memo status updated successfully");
			refetchCashMemos();
			setShowAcceptModal({ show: false, id: 0 });
		}
	};

	const rejectStatusUpdate = async (id: number, reason: string) => {
		const newData = {
			status:
				user?.role == "HR_INSPECTOR"
					? "REJECT_BY_HR"
					: user?.role == "HR_MANAGER"
					? "REJECT_BY_HR_MANAGER"
					: "",
			reason: reason,
		};

		if (newData.status == "") return;

		const result = await updateCashMemoStatus({
			id,
			data: newData,
		});

		if (result) {
			showSuccessToast("Cash memo status updated successfully");
			refetchCashMemos();
			setShowRejectModal({ show: false, id: 0 });
		}
	};

	const finishStatusUpdate = async (id: number, amount: number) => {
		const newData = {
			status: "DONE",
			paidAmount: amount,
		};

		const result = await updateCashMemoStatus({
			id,
			data: newData,
		});

		if (result) {
			const financeData = await getCashMemoFinanceApi(
				showFinishModal.supervisorId
			);

			generatePDF(financeData ?? [], amount);
			handleExportCSV();

			showSuccessToast("Cash memo status updated successfully");
			refetchCashMemos();
			setShowFinishModal({
				show: false,
				id: 0,
				supervisorId: 0,
				data: null,
			});
		}
	};

	const getShiftPrice = useMemo<number>(() => {
		if (watchContractor && watchShift) {
			const contractor = contractorsData?.find(
				(c) => c.id === watchContractor
			);

			if (contractor) {
				if (watchShift === Shift.MORNING) {
					return contractor.morningPrice;
				} else if (watchShift === Shift.NIGHT) {
					return contractor.nightPrice;
				} else if (watchShift === Shift.EVENING) {
					return contractor.eveningPrice;
				}
			}
		}
		return 0;
	}, [contractorsData, watchContractor, watchShift]);

	const calculatePrice = () => {
		const shiftPrice = getShiftPrice;

		const singleWorkers = watchedWards.reduce(
			(sum, ward) => sum + ward.singleWorkers,
			0
		);
		const doubleWorkers = watchedWards.reduce(
			(sum, ward) => sum + (ward.doubleWorkers ?? 0),
			0
		);
		const labourDeducted = watchedWards.reduce(
			(sum, ward) => sum + (ward.labourDeducted ?? 0),
			0
		);

		// Deduct labourDeducted from singleWorkers, never negative
		const effectiveSingleWorkers = singleWorkers - labourDeducted;
		const adjustedSingleWorkers =
			effectiveSingleWorkers < 0 ? 0 : effectiveSingleWorkers;

		const singlePrice = adjustedSingleWorkers * shiftPrice;
		const doublePrice = doubleWorkers * (shiftPrice * 2);

		return singlePrice + doublePrice;
	};

	if (isLoading) return <ApiLoading />;
	if (isError) return <ApiError />;

	return (
		<div className="space-y-4">
			<div className="flex md:flex-row flex-col gap-2 items-center justify-between">
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Cash Memo
					</h2>
					<p className="text-muted-foreground">
						Manage your cash memos
					</p>
				</div>
				<div className="flex space-x-2 md:flex-row flex-col gap-2">
					<Button onClick={handleExportCSV} variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Cash Memo</CardTitle>
					<CardDescription>
						View and filter cash memo records.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Date Filter */}
					<div className="flex flex-col gap-4 py-4 items-center">
						<div className="flex gap-2 md:flex-row flex-col w-full items-center">
							<div className="flex items-center gap-4 flex-1">
								<Label htmlFor="name" className="text-right">
									Zone
								</Label>
								<Select
									onValueChange={(val) => {
										setSelectedZones(Number(val));
									}}
									value={selectedZones.toString()}
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

							<div className="flex items-center gap-4 flex-1">
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

							<div className="flex items-center gap-4 flex-1">
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
									setSelectedZones(0);
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
						onView={handleView}
						onEdit={handleEdit}
						onAccept={(item: CashMemoResponse) => {
							setShowAcceptModal({ show: true, id: item.id });
						}}
						onReject={(item: CashMemoResponse) =>
							setShowRejectModal({
								show: true,
								id: item.id,
							})
						}
						onFinish={(item: CashMemoResponse) =>
							setShowFinishModal({
								show: true,
								id: item.id,
								supervisorId: item.supervisorId,
								data: item,
							})
						}
					/>
				</CardContent>
			</Card>

			<FormModal
				open={open}
				onOpenChange={setOpen}
				title={
					isEdit
						? "Edit Cash Memo"
						: isView
						? "View Cash Memo"
						: "Add Cash Memo"
				}
				customStyle="sm:max-w-[70vw]"
			>
				<div>
					<div className="grid md:grid-cols-2 grid-cols-1 gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Zone
							</Label>
							<Controller
								control={control}
								name="zoneId"
								render={({ field }) => (
									<Select
										onValueChange={(val) => {
											field.onChange(Number(val));
											setValue("ucId", 0);
											setValue("wards", []);
										}}
										disabled={isView}
										defaultValue={field.value.toString()}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select zone" />
										</SelectTrigger>
										<SelectContent>
											{getZoneData()?.map((zone) => (
												<SelectItem
													key={zone.id}
													value={zone.id.toString()}
												>
													{zone.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.zoneId && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.zoneId.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Union Council
							</Label>
							<Controller
								control={control}
								name="ucId"
								render={({ field }) => (
									<Select
										onValueChange={(val) => {
											field.onChange(Number(val));
											setValue("wards", []);
										}}
										disabled={isView}
										defaultValue={field.value.toString()}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select UC" />
										</SelectTrigger>
										<SelectContent>
											{getUnionCouncilData()?.map(
												(uc) => (
													<SelectItem
														key={uc.id}
														value={uc.id.toString()}
													>
														{uc.name}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.ucId && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.ucId.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Ward
							</Label>
							<div className="col-span-3 space-y-2">
								<Controller
									control={control}
									name="wards"
									render={({ field }) => (
										<MultiSelect
											options={getWardData()}
											value={field.value}
											returnIds={true}
											onChange={(val: number[]) =>
												field.onChange(val.map(Number))
											}
											disabled={isView}
											placeholder="Select Wards"
										/>
									)}
								/>
								{watchedWards?.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{watchedWards?.map((ward) => (
											<Badge
												key={ward.wardId}
												variant="secondary"
												className="text-xs"
											>
												{getWardData().find(
													(wardD) =>
														Number(wardD.id) ===
														Number(ward.wardId)
												)?.name ?? ""}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														removeItem(ward.wardId)
													}
													disabled={isView}
												>
													<X className="h-3 w-3" />
												</Button>
											</Badge>
										))}
									</div>
								)}
								{errors.wards && (
									<p className="text-sm text-red-500">
										{errors.wards.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Contractor
							</Label>
							<Controller
								control={control}
								name="contractorId"
								render={({ field }) => (
									<Select
										onValueChange={(val) =>
											field.onChange(Number(val))
										}
										defaultValue={field.value.toString()}
										disabled={isView}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select Contractor" />
										</SelectTrigger>
										<SelectContent>
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
								)}
							/>
							{errors.contractorId && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.contractorId.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="shift" className="text-right">
								Shift
							</Label>
							<Controller
								control={control}
								name="shift"
								render={({ field }) => (
									<Select
										onValueChange={(val) =>
											field.onChange(val)
										}
										defaultValue={field.value}
										disabled={isView}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select Shift" />
										</SelectTrigger>
										<SelectContent>
											{SHIFT_OPTIONS?.map((s) => (
												<SelectItem
													key={s.id}
													value={s.id.toString()}
												>
													{s.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.shift && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.shift.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="deployDate" className="text-right">
								Deploy Date
							</Label>
							<Controller
								control={control}
								name="deployDate"
								render={({ field }) => (
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"col-span-3 justify-start text-left font-normal hover:bg-card-foreground ",
													!field.value &&
														"text-muted-foreground"
												)}
												disabled={isView}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? (
													format(field.value, "PPP")
												) : (
													<span>Pick a date</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-auto p-0"
											align="start"
										>
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
												initialFocus
												className="p-3 pointer-events-auto"
											/>
										</PopoverContent>
									</Popover>
								)}
							/>
							{errors.deployDate && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.deployDate.message}
								</p>
							)}
						</div>

						<div className="py-4" />
						{watchedWards.map((ward) => (
							<div
								key={ward.wardId}
								className="grid grid-cols-4 items-center gap-4 col-span-2 py-2"
							>
								<Label htmlFor="name" className="text-right">
									{ward.wardName ?? ward.wardId}
								</Label>
								<div className="flex flex-col space-y-2">
									<Label
										htmlFor="name"
										className="text-right"
									>
										Single Workers
									</Label>
									<Input
										type="number"
										placeholder="Single Workers"
										value={ward.singleWorkers}
										disabled={isView}
										onChange={(e) => {
											setValue(
												"wards",
												watchedWards.map((w) =>
													w.wardId === ward.wardId
														? {
																...w,
																singleWorkers:
																	Number(
																		e.target
																			.value
																	),
														  }
														: w
												)
											);
										}}
									/>
								</div>
								<div className="flex flex-col space-y-2">
									<Label
										htmlFor="name"
										className="text-right"
									>
										Double Workers
									</Label>
									<Input
										type="number"
										placeholder="Double Workers"
										value={ward.doubleWorkers ?? 0}
										disabled={isView}
										onChange={(e) => {
											setValue(
												"wards",
												watchedWards.map((w) =>
													w.wardId === ward.wardId
														? {
																...w,
																doubleWorkers:
																	Number(
																		e.target
																			.value
																	),
														  }
														: w
												)
											);
										}}
									/>
								</div>
								<div className="flex flex-col space-y-2">
									<Label
										htmlFor="name"
										className="text-right"
									>
										Labour Deducted
									</Label>
									<Input
										type="number"
										placeholder="Labour Deducted"
										value={ward.labourDeducted ?? 0}
										disabled={isView}
										onChange={(e) => {
											setValue(
												"wards",
												watchedWards.map((w) =>
													w.wardId === ward.wardId
														? {
																...w,
																labourDeducted:
																	Number(
																		e.target
																			.value
																	),
														  }
														: w
												)
											);
										}}
									/>
								</div>
							</div>
						))}
					</div>
					{/* Price Display */}
					<div className="p-4 bg-gray-50 rounded-lg w-full col-span-2">
						<div className="flex justify-between items-center">
							<span className="font-medium">
								Auto-calculated Price:
							</span>
							<span className="text-2xl font-bold text-green-600">
								Rs. {calculatePrice()}
							</span>
						</div>
					</div>
					<div className="flex justify-end my-4 ">
						{isView ? (
							<Button
								onClick={() => {
									setIsView(false);
									setOpen(false);
								}}
							>
								Close
							</Button>
						) : (
							<Button
								type="submit"
								onClick={handleSubmit(onSubmit)}
								disabled={isUpdating}
							>
								{isUpdating ? "Saving..." : "Save changes"}
							</Button>
						)}
					</div>
				</div>
			</FormModal>

			<AlertBox
				open={showAcceptModal.show}
				close={() => setShowAcceptModal({ show: false, id: 0 })}
				onDone={() => acceptStatusUpdate(showAcceptModal.id)}
			/>

			<RejectModal
				open={showRejectModal.show}
				setOpen={() => setShowRejectModal({ show: false, id: 0 })}
				onDone={(reason: string) =>
					rejectStatusUpdate(showRejectModal.id, reason)
				}
			/>

			{showFinishModal.show && (
				<FinanceBox
					open={showFinishModal.show}
					setOpen={() =>
						setShowFinishModal({
							show: false,
							id: 0,
							supervisorId: 0,
							data: null,
						})
					}
					onDone={(amount: number) =>
						finishStatusUpdate(showFinishModal.id, amount)
					}
					supervisorId={showFinishModal.supervisorId}
					totalAmount={showFinishModal.data?.totalAmount ?? 0}
				/>
			)}
		</div>
	);
};

export default CashMemo;
