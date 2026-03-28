"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAttendanceApi } from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";

const Attendance = () => {
	const {
		data: attendance,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["attendance"],
		queryFn: getAttendanceApi,
	});

	const [search, setSearch] = useState("");
	const [startDate, setStartDate] = useState<Date>();
	const [endDate, setEndDate] = useState<Date>();

	const filteredAttendance = attendance?.filter((record) => {
		const matchesSearch = record.supervisor
			.toLowerCase()
			.includes(search.toLowerCase());

		let matchesDateRange = true;
		if (startDate && endDate) {
			const recordDate = new Date(record.createdAt);
			matchesDateRange = recordDate >= startDate && recordDate <= endDate;
		} else if (startDate) {
			const recordDate = new Date(record.createdAt);
			matchesDateRange = recordDate >= startDate;
		} else if (endDate) {
			const recordDate = new Date(record.createdAt);
			matchesDateRange = recordDate <= endDate;
		}

		return matchesSearch && matchesDateRange;
	});

	if (isLoading) {
		return <ApiLoading />;
	}

	if (isError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4">
				<h1 className="text-2xl font-semibold">Attendance</h1>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Attendance Records</CardTitle>
					<CardDescription>
						View and filter attendance records for supervisors.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row gap-4 mb-6 ">
						<div className="flex-1">
							<Input
								placeholder="Search by supervisor name..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full"
							/>
						</div>

						<div className="flex gap-2 md:flex-row flex-col">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full md:w-max md:min-w-[170px] justify-start text-left font-normal hover:bg-card-foreground",
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
											"w-full md:w-max md:min-w-[170px] justify-start text-left font-normal hover:bg-card-foreground",
											!endDate && "text-muted-foreground"
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

							<Button
								variant="outline"
								onClick={() => {
									setStartDate(undefined);
									setEndDate(undefined);
									setSearch("");
								}}
							>
								Clear Filters
							</Button>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="text-gray-500 ">
									Supervisor Name
								</TableHead>
								<TableHead className="text-gray-500 ">
									Total Workers
								</TableHead>
								<TableHead className="text-gray-500 ">
									Attendance
								</TableHead>
								<TableHead className="text-gray-500 ">
									Date
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredAttendance?.map((record) => (
								<TableRow
									key={record.id}
									className="border-b border-gray-200 hover:bg-gray-50 "
								>
									<TableCell className="font-medium py-4">
										{record.supervisor}
									</TableCell>
									<TableCell>{record.totalWorkers}</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="bg-green-100 text-green-800 hover:bg-green-200"
										>
											Present
										</Badge>
									</TableCell>
									<TableCell>
										{format(
											record.createdAt,
											"dd/MM/yyyy hh:mm a"
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					{filteredAttendance?.length === 0 && (
						<div className="text-center py-8 text-gray-500">
							No attendance records found matching your criteria.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Attendance;
