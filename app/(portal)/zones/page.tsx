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
import { Edit, Trash2, X } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { showSuccessToast } from "@/lib/toaster";
import FormModal from "@/components/FormModal";
import { zoneSchema } from "@/lib/schemas";
import MultiSelect from "@/components/MultiSelect";
import {
	createZoneApi,
	deleteZoneApi,
	ucApi,
	updateZoneApi,
	zonesApi,
} from "@/lib/apis";
import { useMutation, useQuery } from "@tanstack/react-query";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { ZonesResponse } from "@/lib/apiTypes";
import { MultiSelectOption } from "@/lib/types";

type ZoneFormData = z.infer<typeof zoneSchema>;

const Zones = () => {
	const {
		data: ucsData,
		isLoading: isUcLoading,
		isError: isUcError,
		isSuccess: isUcSuccess,
	} = useQuery({
		queryKey: ["ucs"],
		queryFn: ucApi,
	});

	const {
		data: zonesData,
		isLoading: isZonesLoading,
		isError: isZonesError,
		refetch: refetchZones,
	} = useQuery({
		queryKey: ["zones"],
		queryFn: zonesApi,
		enabled: isUcSuccess,
	});

	const { mutateAsync: createZone, isPending: isCreateZonePending } =
		useMutation({
			mutationKey: ["createZone"],
			mutationFn: createZoneApi,
		});

	const { mutateAsync: updateZone, isPending: isUpdateZonePending } =
		useMutation({
			mutationKey: ["updateZone"],
			mutationFn: ({ id, data }: { id: number; data: any }) => {
				return updateZoneApi(id, data);
			},
		});

	const { mutateAsync: deleteZone, isPending: isDeleteZonePending } =
		useMutation({
			mutationKey: ["deleteZone"],
			mutationFn: deleteZoneApi,
		});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ZonesResponse | null>(null);

	const form = useForm<ZoneFormData>({
		resolver: zodResolver(zoneSchema),
		defaultValues: {
			name: "",
			ucNames: [],
		},
		mode: "onChange",
	});

	const { control, handleSubmit, reset, watch, setValue } = form;
	const selectedUCs = watch("ucNames");

	const onSubmit = (data: ZoneFormData) => {
		if (editingItem) {
			handleEdit(editingItem, data);
		} else {
			handleCreate(data);
		}
	};

	const handleCreate = async (data: ZoneFormData) => {
		const result = await createZone({
			...data,
			unionCouncils: selectedUCs.map(Number),
		});
		if (result) {
			setIsModalOpen(false);
			reset();
			showSuccessToast("Success", "Zone created successfully.");
			refetchZones();
		}
	};

	const handleEdit = async (item: ZonesResponse, data: ZoneFormData) => {
		const result = await updateZone({
			id: item.id,
			data: {
				...data,
				unionCouncils: selectedUCs.map(Number),
			},
		});
		if (result) {
			setIsModalOpen(false);
			setEditingItem(null);
			reset();
			showSuccessToast("Success", "Zone updated successfully.");
			refetchZones();
		}
	};

	const handleDelete = async (id: number) => {
		await deleteZone(id);
		showSuccessToast("Success", "Zone deleted successfully.");
		refetchZones();
	};

	const handleOpenEditModal = (item: ZonesResponse) => {
		setEditingItem(item);
		reset({
			name: item.name,
			ucNames: item.unionCouncils.map((uc) => uc.id.toString()),
		});
		setIsModalOpen(true);
	};

	const handleOpenCreateModal = () => {
		setEditingItem(null);
		reset({
			name: "",
			ucNames: [],
		});
		setIsModalOpen(true);
	};

	const handleAddUC = (ucNames: string[]) => {
		if (ucNames.length > 0) {
			setValue("ucNames", ucNames);
		}
	};

	const handleRemoveUC = (ucId: string) => {
		setValue(
			"ucNames",
			selectedUCs.filter((uc) => uc !== ucId)
		);
	};

	const getUCData = () => {
		const data: MultiSelectOption[] = [];

		ucsData?.forEach((uc) => {
			data.push({
				id: uc.id.toString(),
				name: uc.name,
			});
		});

		return data;
	};

	if (isZonesLoading || isUcLoading) {
		return <ApiLoading />;
	}

	if (isZonesError || isUcError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-semibold">Zones</h1>
				<Button onClick={handleOpenCreateModal}>Add Zone</Button>
			</div>

			<Card className="border-none px-4">
				<CardHeader>
					<CardTitle>Zone List</CardTitle>
					<CardDescription>
						Manage your zones and their details here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14 ">
								<TableHead className="w-[100px] text-gray-500 border-b border-gray-200">
									ID
								</TableHead>
								<TableHead className="text-gray-500 border-b border-gray-200">
									Name
								</TableHead>
								<TableHead className="text-gray-500 border-b border-gray-200">
									UCs
								</TableHead>
								<TableHead className="text-right text-gray-500 border-b border-gray-200">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{zonesData?.map((zone) => (
								<TableRow
									key={zone.id}
									className="border-b border-gray-200 hover:bg-gray-50 "
								>
									<TableCell className="font-medium">
										{zone.id}
									</TableCell>
									<TableCell>{zone.name}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{zone.unionCouncils.map((uc) => (
												<Badge
													key={uc.id}
													variant="secondary"
													className="text-xs"
												>
													{uc.name}
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
													handleOpenEditModal(zone)
												}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleDelete(zone.id)
												}
												disabled={isDeleteZonePending}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
						<TableFooter>
							<TableRow className="h-14">
								<TableCell colSpan={6}>
									{zonesData?.length} zone(s) in total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingItem ? "Edit Zone" : "Create Zone"}
				description={
					editingItem
						? "Make changes to your zone here. Click save when you're done."
						: "Add a new zone to the list. Click save when you're done."
				}
			>
				<div>
					<div className="grid gap-4 py-4">
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
										placeholder="Zone name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label
								htmlFor="ucNames"
								className="text-right mt-2"
							>
								UCs
							</Label>
							<div className="col-span-3 space-y-2">
								<MultiSelect
									options={getUCData()}
									value={selectedUCs}
									returnIds={true}
									onChange={handleAddUC}
									placeholder="Select UCs"
								/>
								{selectedUCs.length > 0 && (
									<div className="flex flex-wrap gap-1 ">
										{selectedUCs.map((ucId, i) => (
											<Badge
												key={`${ucId}-${i}`}
												variant="secondary"
												className="text-xs"
											>
												{ucsData?.find(
													(uc) =>
														uc.id === Number(ucId)
												)?.name ?? ""}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														handleRemoveUC(ucId)
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
							type="submit"
							onClick={handleSubmit(onSubmit)}
							disabled={
								isCreateZonePending || isUpdateZonePending
							}
						>
							{isCreateZonePending
								? "Saving..."
								: isUpdateZonePending
								? "Updating..."
								: "Save changes"}
						</Button>
					</div>
				</div>
			</FormModal>
		</div>
	);
};

export default Zones;
