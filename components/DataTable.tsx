/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { CashMemoResponse } from "@/lib/apiTypes";
import { format } from "date-fns";
import useUserStore from "@/state/userState";

interface Column {
	key: string;
	label: string;
}

interface DataTableProps {
	data: CashMemoResponse[];
	columns: Column[];
	onAdd?: () => void;
	onView?: (item: any) => void;
	onEdit?: (item: any) => void;
	onAccept?: (item: any) => void;
	onReject?: (item: any) => void;
	onFinish?: (item: any) => void;
	onDownloadLedger?: (id: number) => void;
	title: string;
	showActions?: boolean;
}

function toSecureVideoUrl(url: string): string {
	try {
		const parsed = new URL(url);

		// Only convert if it's the expected domain
		if (
			parsed.hostname === "back.aysisdailywager.com" &&
			parsed.protocol === "http:"
		) {
			parsed.protocol = "https:";
		}

		return parsed.toString();
	} catch (error: any) {
		console.error("Invalid video URL:", url, error);
		return url;
	}
}

const DataTable = ({
	data: filteredData,
	columns,
	onAdd,
	onView,
	onEdit,
	title,
	onAccept,
	onReject,
	onFinish,
	onDownloadLedger,
	showActions = true,
}: DataTableProps) => {
	const { user } = useUserStore();

	const tableCellView = (item: any, column: Column) => {
		const value = item[column.key];
		// const valLower =
		// 	typeof value == "string" ? value.toLowerCase() : `${value}`;

		switch (column.key) {
			case "videoUrl":
				return (
					<Button
						variant={"outline"}
						onClick={() => {
							const allUrls = value.split(",");

							allUrls.forEach((url: string, index: number) => {
								const secureUrl = toSecureVideoUrl(url.trim());
								setTimeout(() => {
									const link = document.createElement("a");
									link.href = secureUrl;
									link.download =
										url.trim().split("/").pop() ||
										"video.mp4";
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
								}, index * 1000); // 1 second between each download
							});
						}}
					>
						Download Video
					</Button>
				);
			case "status":
				return (
					<Badge
						variant="secondary"
						className={cn(
							"bg-green-100 text-green-800 hover:bg-green-200",
							value == "pending" &&
								"bg-blue-100 text-blue-800 hover:bg-blue-200",
							(value == "REJECT_BY_HR" ||
								value == "REJECT_BY_HR_MANAGER") &&
								"bg-red-100 text-red-800 hover:bg-red-200"
						)}
					>
						{value}
					</Badge>
				);
			case "cashMemoHistory":
				return (
					<div className="flex flex-col space-y-1">
						{value?.map((v: string, i: number) => (
							<span key={`${v}-${i}`} className="text-sm">
								{i + 1}: {v}
							</span>
						))}
					</div>
				);
			case "createdAt":
			case "deployDate":
				return format(new Date(value), "dd/MM/yyyy hh:mm a");
			case "totalAmount":
				return <span className="text-sm">Rs. {value}</span>;
			case "wardNames":
				return <span className="text-sm">{value.join(", ")}</span>;
			case "paidStatus":
				return (
					<Badge
						variant={value == "PAID" ? "default" : "destructive"}
						className={cn(
							value == "PAID"
								? "bg-green-500 text-white hover:bg-green-200"
								: "bg-red-500 text-white hover:bg-red-200"
						)}
					>
						<span className="text-sm">
							{value == "PAID" ? "Paid" : "Pending"}
						</span>
					</Badge>
				);
			default:
				return <span className="text-sm">{value}</span>;
		}
	};

	const canShowActions = (
		action: "accept" | "reject" | "finish",
		data: CashMemoResponse
	) => {
		if (user?.role == "HR_INSPECTOR" && data.status == "PENDING") {
			if (action == "accept") {
				return true;
			}
			if (action == "reject") {
				return true;
			}
		}

		if (
			user?.role == "HR_MANAGER" &&
			(data.status == "APPROVE_BY_HR" || data.status == "REJECT_BY_HR")
		) {
			if (action == "accept") {
				return true;
			}
			if (action == "reject") {
				return true;
			}
		}

		if (user?.role == "FINANCE" && data.status == "APPROVE_BY_HR_MANAGER") {
			if (action == "finish") {
				return true;
			}
		}

		return false;
	};

	const canShowEdit = (data: CashMemoResponse) => {
		if (user?.role == "HR_INSPECTOR") {
			if (data.status == "PENDING") {
				return true;
			}
		}

		if (user?.role == "HR_MANAGER") {
			if (
				data.status == "APPROVE_BY_HR" ||
				data.status == "REJECT_BY_HR"
			) {
				return true;
			}
		}

		return false;
	};

	return (
		<div className="space-y-4">
			{title && (
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold tracking-tight">
							{title}
						</h2>
						<p className="text-muted-foreground">
							Manage your {title.toLowerCase()}
						</p>
					</div>
					{onAdd && (
						<Button onClick={onAdd}>
							<Plus className="mr-2 h-4 w-4" />
							Add {title.slice(0, -1)}
						</Button>
					)}
				</div>
			)}

			<Table>
				<TableHeader>
					<TableRow className="h-14">
						{columns.map((column) => (
							<TableHead
								key={column.key}
								className={"text-gray-500 "}
							>
								{column.label}
							</TableHead>
						))}
						{showActions && (
							<TableHead className="text-right text-gray-500 ">
								Pass Action
							</TableHead>
						)}
						{showActions && (
							<TableHead className="text-right text-gray-500 ">
								Actions
							</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredData.map((item, index) => (
						<TableRow
							key={index}
							className="border-b border-gray-200 hover:bg-gray-50 items-center"
						>
							{columns.map((column) => (
								<TableCell
									key={column.key}
									className={cn(
										"py-5",
										column.key == "cashMemoHistory" &&
											"max-w-[200px] !text-wrap"
									)}
								>
									{tableCellView(item, column)}
								</TableCell>
							))}
							{showActions && (
								<TableCell className="flex flex-col gap-2">
									{canShowActions("accept", item) &&
										onAccept && (
											<Button
												className="py-0"
												onClick={() => onAccept(item)}
											>
												Accept
											</Button>
										)}
									{canShowActions("reject", item) &&
										onReject && (
											<Button
												variant={"destructive"}
												className="py-0"
												onClick={() => onReject(item)}
											>
												Reject
											</Button>
										)}
									{canShowActions("finish", item) &&
										onFinish && (
											<Button
												className="py-0 bg-emerald-500 hover:bg-emerald-700"
												onClick={() => onFinish(item)}
											>
												Finish
											</Button>
										)}
								</TableCell>
							)}
							{!showActions && onDownloadLedger && (
								<TableCell className="flex flex-col  items-center justify-center">
									<Button
										className="py-0 "
										onClick={() =>
											onDownloadLedger(item.supervisorId)
										}
									>
										<span>Download Ledger</span>
									</Button>
								</TableCell>
							)}
							{showActions && (
								<TableCell className="text-right">
									<div className="flex items-center justify-end space-x-2">
										{onView && (
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() => onView(item)}
											>
												<Eye className="h-4 w-4" />
											</Button>
										)}
										{onEdit && canShowEdit(item) && (
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() => onEdit(item)}
											>
												<Edit className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
				<TableFooter className="border-t border-gray-200">
					<TableRow>
						<TableCell colSpan={24} className="py-4 font-semibold">
							{filteredData.length} cash memo(s) in total
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	);
};

export default DataTable;
