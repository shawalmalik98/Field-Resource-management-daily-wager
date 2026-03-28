/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Edit, CalendarIcon } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { employeeSchema } from "@/lib/schemas";

import FormModal from "@/components/FormModal";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EmployeeResponse } from "@/lib/apiTypes";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	addEmployeeApi,
	departmentApi,
	designationApi,
	employeeApi,
	updateEmployeeApi,
	zonesApi,
} from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { showSuccessToast } from "@/lib/toaster";

type EmployeeFormData = z.infer<typeof employeeSchema>;

const Employees = () => {
	const {
		data: depdesZones,
		isLoading: isDepdesZonesLoading,
		isError: isDepdesZonesError,
		isSuccess: isDepdesZonesSuccess,
	} = useQuery({
		queryKey: ["depdesZones"],
		queryFn: async () => {
			const [res1, res2, res3] = await Promise.all([
				departmentApi(),
				designationApi(),
				zonesApi(),
			]);
			return { departments: res1, designations: res2, zones: res3 };
		},
	});

	const {
		data: employees,
		isLoading,
		isError,
		refetch: refetchEmployees,
	} = useQuery({
		queryKey: ["employees"],
		queryFn: employeeApi,
		enabled: isDepdesZonesSuccess,
	});

	const { mutateAsync: createEmployee, isPending: isCreating } = useMutation({
		mutationKey: ["createEmployee"],
		mutationFn: addEmployeeApi,
	});

	const { mutateAsync: updateEmployee, isPending: isUpdating } = useMutation({
		mutationKey: ["updateEmployee"],
		mutationFn: ({ id, data }: { id: number; data: any }) =>
			updateEmployeeApi(id, data),
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<EmployeeResponse | null>(
		null
	);

	const form = useForm<EmployeeFormData>({
		resolver: zodResolver(employeeSchema),
		defaultValues: {
			name: "",
			fatherName: "",
			cnic: "",
			contactNo: "",
			designation: 0,
			department: 0,
			joiningDate: new Date(),
			zoneId: 0,
			email: "",
		},
		mode: "onChange",
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = form;

	const onSubmit = (data: EmployeeFormData) => {
		if (editingItem) {
			handleEdit(editingItem, data);
		} else {
			handleCreate(data);
		}
	};

	const handleCreate = async (data: EmployeeFormData) => {
		const result = await createEmployee({
			...data,
			joiningDate: data.joiningDate.toISOString(),
		});
		if (result) {
			setIsModalOpen(false);
			reset();
			showSuccessToast("Employee created successfully");
			refetchEmployees();
		}
	};

	const handleEdit = async (
		item: EmployeeResponse,
		data: EmployeeFormData
	) => {
		const result = await updateEmployee({
			id: item.id,
			data: {
				...data,
				joiningDate: data.joiningDate.toISOString(),
				isActive: item.isActive,
			},
		});
		if (result) {
			setIsModalOpen(false);
			setEditingItem(null);
			reset({
				name: item.name,
				fatherName: item.fatherName || "",
				cnic: item.cnic || "",
				contactNo: item.contactNo || "",
				designation: Number(item.designation),
				department: Number(item.department),
				joiningDate: item.joiningDate || new Date(),
				zoneId: item.zone.id || 0,
				email: item.user?.email || "",
			});
			showSuccessToast("Employee updated successfully");
			refetchEmployees();
		}
	};

	const handleOpenEditModal = (item: EmployeeResponse) => {
		setEditingItem(item);
		form.reset({
			name: item.name,
			fatherName: item.fatherName || "",
			cnic: item.cnic || "",
			contactNo: item.contactNo || "",
			designation: item.designation.id,
			department: item.department.id,
			joiningDate: item.joiningDate
				? new Date(item.joiningDate)
				: new Date(),
			zoneId: item.zone.id || 0,
			email: item.user?.email || "",
		});
		setIsModalOpen(true);
	};

	const handleOpenCreateModal = () => {
		setEditingItem(null);
		reset({
			name: "",
			fatherName: "",
			cnic: "",
			contactNo: "",
			designation: 0,
			department: 0,
			joiningDate: new Date(),
			zoneId: 0,
			email: "",
		});
		setIsModalOpen(true);
	};

	const onActiveUserChange = (item: EmployeeResponse, checked: boolean) => {
		toast
			.promise(
				updateEmployee({
					id: item.id,
					data: {
						...item,
						department: item.department.id,
						designation: item.designation.id,
						zoneId: item.zone.id,
						isActive: checked,
					},
				}),
				{
					loading: "Updating employee status...",
					success: "Employee status updated successfully",
					error: "Failed to update employee status",
				}
			)
			.unwrap()
			.then(() => {
				refetchEmployees();
			});
	};

	if (isLoading || isDepdesZonesLoading) {
		return <ApiLoading />;
	}

	if (isError || isDepdesZonesError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-semibold">Employees</h1>
				<Button onClick={handleOpenCreateModal}>Add Employee</Button>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Employee List</CardTitle>
					<CardDescription>
						Manage your employees and their details here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="text-gray-500 ">
									Name
								</TableHead>
								<TableHead className="text-gray-500 ">
									Father Name
								</TableHead>
								<TableHead className="text-gray-500 ">
									Email
								</TableHead>
								<TableHead className="text-gray-500 ">
									CNIC
								</TableHead>
								<TableHead className="text-gray-500 ">
									Contact
								</TableHead>
								<TableHead className="text-gray-500 ">
									Department
								</TableHead>
								<TableHead className="text-gray-500 ">
									Designation
								</TableHead>
								<TableHead className="text-gray-500 ">
									Joining Date
								</TableHead>
								<TableHead className="text-gray-500 ">
									Zone
								</TableHead>
								<TableHead className="text-right text-gray-500 ">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{employees?.map((employee) => (
								<TableRow
									key={employee.id}
									className="border-b border-gray-200 hover:bg-gray-50 py-4"
								>
									<TableCell className="font-medium py-4">
										{employee.name}
									</TableCell>
									<TableCell>{employee.fatherName}</TableCell>
									<TableCell>{employee.email}</TableCell>
									<TableCell>{employee.cnic}</TableCell>
									<TableCell>{employee.contactNo}</TableCell>
									<TableCell>
										{employee.department.name ?? ""}
									</TableCell>
									<TableCell>
										{employee.designation.name ?? ""}
									</TableCell>
									<TableCell>
										{employee.joiningDate
											? format(
													employee.joiningDate,
													"PPP"
											  )
											: ""}
									</TableCell>
									<TableCell>{employee.zone.name}</TableCell>
									<TableCell className="py-4">
										<div className="flex flex-col gap-2 items-end ">
											<div className="flex items-center space-x-2">
												<Switch
													id="active-user"
													disabled={isUpdating}
													checked={employee.isActive}
													onCheckedChange={(
														val: boolean
													) =>
														onActiveUserChange(
															employee,
															val
														)
													}
												/>
												<Label htmlFor="active-user">
													Active
												</Label>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleOpenEditModal(
														employee
													)
												}
											>
												<Edit className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter className="border-t border-gray-200">
							<TableRow>
								<TableCell
									colSpan={9}
									className="py-4 font-semibold"
								>
									{employees?.length} employee(s) in total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingItem ? "Edit Employee" : "Create Employee"}
				description={
					editingItem
						? "Make changes to your employee here. Click save when you're done."
						: "Add a new employee to the list. Click save when you're done."
				}
				customStyle="sm:max-w-[70vw]"
			>
				<div>
					<div className="grid grid-cols-2 gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Controller
								control={control}
								name="name"
								render={({ field }) => (
									<Input
										id="name"
										placeholder="Employee name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.name && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.name.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="fatherName" className="text-right">
								Father Name
							</Label>
							<Controller
								control={control}
								name="fatherName"
								render={({ field }) => (
									<Input
										id="fatherName"
										placeholder="Father name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.fatherName && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.fatherName.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="cnic" className="text-right">
								CNIC
							</Label>
							<Controller
								control={control}
								name="cnic"
								render={({ field }) => (
									<Input
										id="cnic"
										placeholder="1234567890123"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.cnic && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.cnic.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="contactNo" className="text-right">
								Contact No
							</Label>
							<Controller
								control={control}
								name="contactNo"
								render={({ field }) => (
									<Input
										id="contactNo"
										placeholder="03001234567"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.contactNo && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.contactNo.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="department" className="text-right">
								Department
							</Label>
							<Controller
								control={control}
								name="department"
								render={({ field }) => (
									<Select
										onValueChange={(val) =>
											field.onChange(Number(val))
										}
										defaultValue={field.value.toString()}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select department" />
										</SelectTrigger>
										<SelectContent>
											{depdesZones?.departments?.map(
												(department) => (
													<SelectItem
														key={department.id}
														value={department.id.toString()}
													>
														{department.name}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.department && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.department.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="designation" className="text-right">
								Designation
							</Label>
							<Controller
								control={control}
								name="designation"
								render={({ field }) => (
									<Select
										onValueChange={(val) =>
											field.onChange(Number(val))
										}
										defaultValue={field.value.toString()}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select designation" />
										</SelectTrigger>
										<SelectContent>
											{depdesZones?.designations?.map(
												(designation) => (
													<SelectItem
														key={designation.id}
														value={designation.id.toString()}
													>
														{designation.name}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
								)}
							/>
							{errors.designation && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.designation.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="joiningDate" className="text-right">
								Joining Date
							</Label>
							<Controller
								control={control}
								name="joiningDate"
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
							{errors.joiningDate && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.joiningDate.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="zone" className="text-right">
								Zone
							</Label>
							<Controller
								control={control}
								name="zoneId"
								render={({ field }) => (
									<Select
										onValueChange={(val) =>
											field.onChange(Number(val))
										}
										defaultValue={field.value.toString()}
									>
										<SelectTrigger className="col-span-3 w-full min-h-12">
											<SelectValue placeholder="Select zone" />
										</SelectTrigger>
										<SelectContent>
											{depdesZones?.zones?.map((zone) => (
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
								Email Address
							</Label>
							<Controller
								control={control}
								name="email"
								render={({ field }) => (
									<Input
										id="email"
										placeholder="Email Address"
										className="col-span-3"
										{...field}
										value={field.value || ""}
									/>
								)}
							/>
							{errors.email && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.email.message}
								</p>
							)}
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							onClick={handleSubmit(onSubmit)}
							disabled={isCreating || isUpdating}
						>
							{isCreating || isUpdating
								? "Saving..."
								: "Save changes"}
						</Button>
					</div>
				</div>
			</FormModal>
		</div>
	);
};

export default Employees;
