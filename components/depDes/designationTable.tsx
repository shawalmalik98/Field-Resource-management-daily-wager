"use client";
import React, { useState } from "react";

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

import { Edit, Trash2, X } from "lucide-react";
import { DepartmentResponse } from "@/lib/apiTypes";
import { DesignationResponse } from "@/lib/apiTypes";
import { Button } from "../ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addDesignationApi,
	deleteDesignationApi,
	designationApi,
	updateDesignationApi,
} from "@/lib/apis";
import ApiLoading from "../apiLoading";
import ApiError from "../apiError";
import { Badge } from "../ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Label } from "../ui/label";
import FormModal from "../FormModal";
import { Input } from "../ui/input";
import MultiSelect from "../MultiSelect";
import { designationSchema } from "@/lib/schemas";
import { z } from "zod";
import { MultiSelectOption } from "@/lib/types";
import { showSuccessToast } from "@/lib/toaster";

type Props = object;
type DesignationFormData = z.infer<typeof designationSchema>;

function DesignationTable({}: Props) {
	const queryClient = useQueryClient();

	const {
		data: designationData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["designation"],
		queryFn: designationApi,
	});

	const departmentData = queryClient.getQueryData<DepartmentResponse[]>([
		"department",
	]);

	const desForm = useForm<DesignationFormData>({
		resolver: zodResolver(designationSchema),
		defaultValues: { name: "", departmentIds: [] },
	});

	const [isDesModalOpen, setIsDesModalOpen] = useState(false);

	const [editingDes, setEditingDes] = useState<DesignationResponse | null>(
		null
	);

	const { mutateAsync: addDesignation, isPending } = useMutation({
		mutationKey: ["addDesignation"],
		mutationFn: addDesignationApi,
		onSuccess: () => {
			showSuccessToast("Designation added successfully");
			queryClient.invalidateQueries({ queryKey: ["designation"] });
		},
	});

	const { mutateAsync: updateDesignation, isPending: isUpdating } =
		useMutation({
			mutationKey: ["updateDesignation"],
			mutationFn: ({
				id,
				data,
			}: {
				id: number;
				data: DesignationFormData;
			}) => updateDesignationApi(id, data),
			onSuccess: () => {
				showSuccessToast("Designation updated successfully");
				queryClient.invalidateQueries({ queryKey: ["designation"] });
			},
		});

	const { mutateAsync: deleteDesignation, isPending: isDeleting } =
		useMutation({
			mutationKey: ["deleteDesignation"],
			mutationFn: deleteDesignationApi,
			onSuccess: () => {
				showSuccessToast("Designation deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["designation"] });
			},
		});

	const onDesSubmit = async (data: DesignationFormData) => {
		if (editingDes) {
			await updateDesignation({ id: editingDes.id, data });
		} else {
			await addDesignation(data);
		}

		setIsDesModalOpen(false);
		setEditingDes(null);
		desForm.reset();
	};

	const handleEditDes = async (des: DesignationResponse) => {
		setEditingDes(des);
		desForm.reset({
			name: des.name,
			departmentIds: des.departments.map((dep) => dep.id),
		});
		setIsDesModalOpen(true);
	};

	const handleAddDepartmentToDesignation = (deptIds: string[]) => {
		desForm.setValue("departmentIds", deptIds.map(Number));
	};

	const handleRemoveDepartmentFromDesignation = (deptId: number) => {
		const currentIds = desForm.watch("departmentIds");
		desForm.setValue(
			"departmentIds",
			currentIds.filter((id: number) => id !== deptId)
		);
	};

	const getDepartmentName = (id: number) => {
		return departmentData?.find((dept) => dept.id == id)?.name || "Unknown";
	};

	const selectedDepartmentIds = desForm.watch("departmentIds");

	const getAvailableDepartments = () => {
		if (!departmentData) return [];

		const newData: MultiSelectOption[] = [];
		for (const dept of departmentData) {
			newData.push({ id: dept.id.toString(), name: dept.name });
		}
		return newData;
	};

	const handleDeleteDes = async (id: number) => {
		await deleteDesignation(id);
	};

	if (isLoading) return <ApiLoading />;
	if (isError) return <ApiError />;

	return (
		<div>
			<Card className="border-none">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Designations</CardTitle>
							<CardDescription>
								Manage your designations here.
							</CardDescription>
						</div>
						<Button
							onClick={() => {
								desForm.reset({
									name: "",
									departmentIds: [],
								});
								setEditingDes(null);
								setIsDesModalOpen(true);
							}}
						>
							Add Designation
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
								<TableHead className="text-gray-500">
									Departments
								</TableHead>
								<TableHead className="text-gray-500 text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{designationData?.map((des) => (
								<TableRow
									key={des.id}
									className="border-b border-gray-200 hover:bg-gray-50 py-4"
								>
									<TableCell className="font-medium">
										{des.id}
									</TableCell>
									<TableCell>{des.name}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{des.departments.map((dep) => (
												<Badge
													key={dep.id}
													variant="secondary"
													className="text-xs"
												>
													{dep.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleEditDes(des)
												}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												disabled={isDeleting}
												onClick={() =>
													handleDeleteDes(des.id)
												}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter className="border-t border-gray-200">
							<TableRow>
								<TableCell
									colSpan={4}
									className="py-4 font-semibold"
								>
									{designationData?.length} designation(s) in
									total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isDesModalOpen}
				onOpenChange={setIsDesModalOpen}
				title={editingDes ? "Edit Designation" : "Add Designation"}
				description={
					editingDes
						? "Update designation details."
						: "Add a new designation."
				}
			>
				<div>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="desName" className="text-right">
								Name
							</Label>
							<Controller
								control={desForm.control}
								name="name"
								render={({ field }) => (
									<Input
										id="desName"
										placeholder="Designation name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="text-right mt-2">
								Departments
							</Label>
							<div className="col-span-3 space-y-2">
								<MultiSelect
									options={getAvailableDepartments()}
									value={selectedDepartmentIds}
									onChange={handleAddDepartmentToDesignation}
									placeholder="Select departments"
									returnIds={true}
								/>
								{selectedDepartmentIds.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{selectedDepartmentIds.map((dep) => (
											<Badge
												key={dep}
												variant="secondary"
												className="text-xs"
											>
												{getDepartmentName(dep)}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														handleRemoveDepartmentFromDesignation(
															dep
														)
													}
												>
													<X className="h-3 w-3" />
												</Button>
											</Badge>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							onClick={desForm.handleSubmit(onDesSubmit)}
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

export default DesignationTable;
