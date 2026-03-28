"use client";

import {
	addDepartmentApi,
	deleteDepartmentApi,
	departmentApi,
	updateDepartmentApi,
} from "@/lib/apis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	TableFooter,
} from "@/components/ui/table";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DepartmentResponse } from "@/lib/apiTypes";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import ApiLoading from "../apiLoading";
import ApiError from "../apiError";
import { Input } from "../ui/input";
import FormModal from "../FormModal";
import { Label } from "../ui/label";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "@/lib/schemas";
import { useState } from "react";
import { z } from "zod";
import { showSuccessToast } from "@/lib/toaster";

type Props = object;
type DepartmentFormData = z.infer<typeof departmentSchema>;

function DepartmentTable({}: Props) {
	const [editingDept, setEditingDept] = useState<DepartmentResponse | null>(
		null
	);
	const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

	const deptForm = useForm<DepartmentFormData>({
		resolver: zodResolver(departmentSchema),
		defaultValues: { name: "" },
	});

	const queryClient = useQueryClient();
	const {
		data: depDesData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["department"],
		queryFn: departmentApi,
	});

	const { mutateAsync: addDepartment, isPending } = useMutation({
		mutationKey: ["addDepartment"],
		mutationFn: addDepartmentApi,
		onSuccess: () => {
			showSuccessToast("Department added successfully");
			queryClient.invalidateQueries({ queryKey: ["department"] });
		},
	});

	const { mutateAsync: updateDepartment, isPending: isUpdating } =
		useMutation({
			mutationKey: ["updateDepartment"],
			mutationFn: ({
				id,
				data,
			}: {
				id: number;
				data: DepartmentFormData;
			}) => updateDepartmentApi(id, data),
			onSuccess: () => {
				showSuccessToast("Department updated successfully");
				queryClient.invalidateQueries({ queryKey: ["department"] });
			},
		});

	const { mutateAsync: deleteDepartment, isPending: isDeleting } =
		useMutation({
			mutationKey: ["deleteDepartment"],
			mutationFn: deleteDepartmentApi,
			onSuccess: () => {
				showSuccessToast("Department deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["department"] });
			},
		});

	const handleEditDept = (dept: DepartmentResponse) => {
		setEditingDept(dept);
		deptForm.reset({ name: dept.name });
		setIsDeptModalOpen(true);
	};

	const onDeptSubmit = async (data: DepartmentFormData) => {
		if (editingDept) {
			const result = await updateDepartment({ id: editingDept.id, data });
			if (result) {
				setIsDeptModalOpen(false);
				setEditingDept(null);
				deptForm.reset();
			}
		} else {
			const result = await addDepartment(data);
			if (result) {
				setIsDeptModalOpen(false);
				setEditingDept(null);
				deptForm.reset();
			}
		}
	};

	const handleDeleteDept = async (id: number) => {
		await deleteDepartment(id);
	};

	if (isLoading) return <ApiLoading />;
	if (isError) return <ApiError />;

	return (
		<div>
			<Card className="border-none">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Departments</CardTitle>
							<CardDescription>
								Manage your departments here.
							</CardDescription>
						</div>
						<Button
							onClick={() => {
								deptForm.reset({ name: "" });
								setEditingDept(null);
								setIsDeptModalOpen(true);
							}}
						>
							Add Department
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="text-gray-500">
									ID
								</TableHead>
								<TableHead className="text-gray-500">
									Name
								</TableHead>
								<TableHead className="text-gray-500 text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{depDesData?.map((dept) => (
								<TableRow
									key={dept.id}
									className="border-b border-gray-200 hover:bg-gray-50 py-4"
								>
									<TableCell className="font-medium">
										{dept.id}
									</TableCell>
									<TableCell>{dept.name}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleEditDept(dept)
												}
											>
												<Edit className="h-4 w-4" />
											</Button>
											{![1, 2, 3].includes(dept.id) && (
												<Button
													variant="ghost"
													size="icon"
													disabled={isDeleting}
													className="hover:bg-card-foreground hover:text-white"
													onClick={() =>
														handleDeleteDept(
															dept.id
														)
													}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter className="border-t border-gray-200">
							<TableRow>
								<TableCell
									colSpan={3}
									className="py-4 font-semibold"
								>
									{depDesData?.length} department(s) in total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isDeptModalOpen}
				onOpenChange={setIsDeptModalOpen}
				title={editingDept ? "Edit Department" : "Add Department"}
				description={
					editingDept
						? "Update department details."
						: "Add a new department."
				}
			>
				<div>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="deptName" className="text-right">
								Name
							</Label>
							<Controller
								control={deptForm.control}
								name="name"
								render={({ field }) => (
									<Input
										id="deptName"
										placeholder="Department name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							onClick={deptForm.handleSubmit(onDeptSubmit)}
							disabled={isPending || isUpdating}
						>
							{isPending || isUpdating ? "Saving..." : "Save"}
						</Button>
					</div>
				</div>
			</FormModal>
		</div>
	);
}

export default DepartmentTable;
