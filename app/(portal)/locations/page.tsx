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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Trash2 } from "lucide-react";
import { showSuccessToast } from "@/lib/toaster";
import { locationSchema } from "@/lib/schemas";
import FormModal from "@/components/FormModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	addLocationApi,
	deleteLocationApi,
	locationApi,
	updateLocationApi,
} from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { LocationResponse } from "@/lib/apiTypes";

type LocationFormData = z.infer<typeof locationSchema>;

const Locations = () => {
	const {
		data: locations,
		isLoading,
		isError,
		refetch: locationsRefetch,
	} = useQuery({
		queryKey: ["locations"],
		queryFn: locationApi,
	});

	const { mutateAsync: addLocation, isPending: isAdding } = useMutation({
		mutationKey: ["addLocation"],
		mutationFn: addLocationApi,
	});

	const { mutateAsync: updateLocation, isPending: isUpdating } = useMutation({
		mutationKey: ["updateLocation"],
		mutationFn: ({ id, data }: { id: number; data: any }) =>
			updateLocationApi(id, data),
	});

	const { mutateAsync: deleteLocation, isPending: isDeleting } = useMutation({
		mutationKey: ["deleteLocation"],
		mutationFn: deleteLocationApi,
	});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<LocationResponse | null>(
		null
	);

	const form = useForm<LocationFormData>({
		resolver: zodResolver(locationSchema),
		defaultValues: {
			name: "",
			longitude: 0,
			latitude: 0,
			radius: 0,
		},
		mode: "onChange",
	});

	const { control, handleSubmit, reset } = form;

	const onSubmit = (data: LocationFormData) => {
		if (editingItem) {
			handleEdit(editingItem, data);
		} else {
			handleCreate(data);
		}
	};

	const handleCreate = async (data: LocationFormData) => {
		const result = await addLocation({
			...data,
			longitude: data.longitude.toString(),
			latitude: data.latitude.toString(),
		});
		if (result) {
			setIsModalOpen(false);
			reset();
			showSuccessToast("Location added successfully.");
			locationsRefetch();
		}
	};

	const handleEdit = async (
		item: LocationResponse,
		data: LocationFormData
	) => {
		const result = await updateLocation({
			id: item.id,
			data: {
				...data,
				longitude: `${data.longitude}`,
				latitude: `${data.latitude}`,
			},
		});
		if (result) {
			setIsModalOpen(false);
			setEditingItem(null);
			reset();
			showSuccessToast("Location updated successfully.");
			locationsRefetch();
		}
	};

	const handleDelete = async (id: number) => {
		await deleteLocation(id);
		showSuccessToast("Location deleted successfully.");
		locationsRefetch();
	};

	const handleOpenEditModal = (item: LocationResponse) => {
		setEditingItem(item);
		reset({
			name: item.name,
			longitude: Number(item.longitude),
			latitude: Number(item.latitude),
			radius: item.radius,
		});
		setIsModalOpen(true);
	};

	const handleOpenCreateModal = () => {
		setEditingItem(null);
		reset({
			name: "",
			longitude: 0,
			latitude: 0,
			radius: 0,
		});
		setIsModalOpen(true);
	};

	if (isLoading) {
		return <ApiLoading />;
	}

	if (isError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-semibold">Locations</h1>
				<Button onClick={handleOpenCreateModal}>Add Location</Button>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Location List</CardTitle>
					<CardDescription>
						Manage your locations and their details here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="w-[100px] text-gray-500 ">
									ID
								</TableHead>
								<TableHead className="text-gray-500 ">
									Name
								</TableHead>
								<TableHead className="text-gray-500 ">
									Longitude
								</TableHead>
								<TableHead className="text-gray-500 ">
									Latitude
								</TableHead>
								<TableHead className="text-gray-500 ">
									Radius
								</TableHead>
								<TableHead className="text-right text-gray-500 ">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{locations?.map((location) => (
								<TableRow
									key={location.id}
									className="border-b border-gray-200 hover:bg-gray-50"
								>
									<TableCell className="font-medium py-4">
										{location.id}
									</TableCell>
									<TableCell className="py-4">
										{location.name}
									</TableCell>
									<TableCell className="py-4">
										{location.longitude}
									</TableCell>
									<TableCell className="py-4">
										{location.latitude}
									</TableCell>
									<TableCell className="py-4">
										{location.radius}
									</TableCell>
									<TableCell className="py-4">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleOpenEditModal(
														location
													)
												}
											>
												<Edit className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="hover:bg-card-foreground hover:text-white"
												onClick={() =>
													handleDelete(location.id)
												}
												disabled={isDeleting}
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
									colSpan={5}
									className="py-4 font-semibold"
								>
									{locations?.length} location(s) in total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingItem ? "Edit Location" : "Create Location"}
				description={
					editingItem
						? "Make changes to your location here. Click save when you're done."
						: "Add a new location to the list. Click save when you're done."
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
										placeholder="Location name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="longitude" className="text-right">
								Longitude
							</Label>
							<Controller
								control={control}
								name="longitude"
								render={({ field }) => (
									<Input
										id="longitude"
										type="number"
										placeholder="Longitude"
										className="col-span-3"
										{...field}
										onChange={(e) => {
											const value = parseFloat(
												e.target.value
											);
											field.onChange(value);
										}}
									/>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="latitude" className="text-right">
								Latitude
							</Label>
							<Controller
								control={control}
								name="latitude"
								render={({ field }) => (
									<Input
										id="latitude"
										type="number"
										placeholder="Latitude"
										className="col-span-3"
										{...field}
										onChange={(e) => {
											const value = parseFloat(
												e.target.value
											);
											field.onChange(value);
										}}
									/>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="radius" className="text-right">
								Radius
							</Label>
							<Controller
								control={control}
								name="radius"
								render={({ field }) => (
									<Input
										id="radius"
										type="number"
										placeholder="Radius"
										className="col-span-3"
										{...field}
										onChange={(e) =>
											field.onChange(
												Number(e.target.value)
											)
										}
									/>
								)}
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							onClick={handleSubmit(onSubmit)}
							disabled={isAdding || isUpdating}
						>
							{isAdding || isUpdating
								? "Saving..."
								: "Save changes"}
						</Button>
					</div>
				</div>
			</FormModal>
		</div>
	);
};

export default Locations;
