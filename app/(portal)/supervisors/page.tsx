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
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Edit, X } from "lucide-react";
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
import MultiSelect from "@/components/MultiSelect";
import { supervisorSchema } from "@/lib/schemas";
import { MultiSelectOption } from "@/lib/types";
import FormModal from "@/components/FormModal";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	addSupervisorApi,
	locationApi,
	supervisorApi,
	updateSupervisorApi,
	zonesHeirarchyApi,
} from "@/lib/apis";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { SupervisorResponse } from "@/lib/apiTypes";
import { showSuccessToast } from "@/lib/toaster";
import { toast } from "sonner";

type SupervisorFormData = z.infer<typeof supervisorSchema>;

const Supervisors = () => {
	const {
		data: locationsZones,
		isLoading: isLocationsZonesLoading,
		isError: isLocationsZonesError,
		isSuccess: isLocationsZonesSuccess,
	} = useQuery({
		queryKey: ["locationsZones"],
		queryFn: async () => {
			const [res1, res2] = await Promise.all([
				locationApi(),
				zonesHeirarchyApi(),
			]);
			return { locations: res1, zones: res2 };
		},
	});

	const {
		data: supervisors,
		isLoading,
		isError,
		refetch: refetchSupervisors,
	} = useQuery({
		queryKey: ["supervisors"],
		queryFn: supervisorApi,
		enabled: isLocationsZonesSuccess,
	});

	const { mutateAsync: createSupervisor, isPending: isCreating } =
		useMutation({
			mutationKey: ["createSupervisor"],
			mutationFn: addSupervisorApi,
		});

	const { mutateAsync: updateSupervisor, isPending: isUpdating } =
		useMutation({
			mutationKey: ["updateSupervisor"],
			mutationFn: ({ id, data }: { id: number; data: any }) =>
				updateSupervisorApi(id, data),
		});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<SupervisorResponse | null>(
		null
	);

	const form = useForm<SupervisorFormData>({
		resolver: zodResolver(supervisorSchema),
		defaultValues: {
			fullName: "",
			cnicNumber: "",
			contactNumber: "",
			address: "",
			zone: 0,
			unionCouncils: [],
			wards: [],
			locations: [],
			email: "",
		},
	});

	const selectedZone = form.watch("zone");
	const selectedUnionCouncils = form.watch("unionCouncils");

	const {
		control,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = form;

	const watchedUnionCouncils = watch("unionCouncils");
	const watchedWards = watch("wards");
	const watchedLocations = watch("locations");

	const onSubmit = (data: SupervisorFormData) => {
		if (editingItem) {
			handleEdit(editingItem, data);
		} else {
			handleCreate(data);
		}
	};

	const handleCreate = async (data: SupervisorFormData) => {
		const newSupervisor = {
			fullName: data.fullName,
			cnicNumber: data.cnicNumber,
			contactNumber: data.contactNumber,
			address: data.address,
			zone: data.zone,
			unionCouncils: data.unionCouncils.map(Number),
			wards: data.wards.map(Number),
			locations: data.locations.map(Number),
			email: data.email,
		};
		const result = await createSupervisor(newSupervisor);
		if (result) {
			setIsModalOpen(false);
			showSuccessToast("Supervisor created successfully");
			reset();
			refetchSupervisors();
		}
	};

	const handleEdit = async (
		item: SupervisorResponse,
		data: SupervisorFormData
	) => {
		const result = await updateSupervisor({ id: item.id, data });
		if (result) {
			setIsModalOpen(false);
			showSuccessToast("Supervisor updated successfully");
			reset();
			refetchSupervisors();
		}
	};

	const handleOpenEditModal = (item: SupervisorResponse) => {
		setEditingItem(item);
		reset({
			fullName: item.fullName,
			cnicNumber: item.cnicNumber,
			contactNumber: item.contactNumber,
			address: item.address,
			zone: item.zoneId,
			unionCouncils: item.ucs.map((uc) => uc.id),
			wards: item.wards.map((ward) => ward.id),
			locations: item.location?.map((location) => location.id),
			email: item.email ?? "",
		});
		setIsModalOpen(true);
	};

	const handleOpenCreateModal = () => {
		setEditingItem(null);
		reset({
			fullName: "",
			cnicNumber: "",
			contactNumber: "",
			address: "",
			zone: 0,
			unionCouncils: [],
			wards: [],
			locations: [],
			email: "",
		});
		setIsModalOpen(true);
	};

	const removeItem = (
		id: number,
		fieldName: "unionCouncils" | "wards" | "locations"
	) => {
		const currentValues =
			fieldName === "unionCouncils"
				? watchedUnionCouncils
				: fieldName === "wards"
				? watchedWards
				: watchedLocations;
		setValue(
			fieldName,
			currentValues.filter((item) => item !== id)
		);
	};

	const getLocationData = () => {
		const data: MultiSelectOption[] = [];

		locationsZones?.locations?.forEach((location) => {
			data.push({ id: location.id.toString(), name: location.name });
		});
		return data;
	};

	const getZoneData = () => {
		const data: MultiSelectOption[] = [];
		locationsZones?.zones?.forEach((zone) => {
			data.push({ id: zone.id.toString(), name: zone.name });
		});
		return data;
	};

	const getUnionCouncilData = () => {
		const data: MultiSelectOption[] = [];

		const sZone = locationsZones?.zones?.find(
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

		const sZone = locationsZones?.zones?.find(
			(zone) => zone.id === selectedZone
		);

		if (sZone) {
			sZone.unionCouncils.forEach((uc) => {
				if (selectedUnionCouncils.includes(uc.id)) {
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

	const onActiveUserChange = async (
		supervisor: SupervisorResponse,
		val: boolean,
		type: "active" | "gallery"
	) => {
		toast
			.promise(
				updateSupervisor({
					id: supervisor.id,
					data: {
						...supervisor,
						zone: supervisor.zoneId,
						locations: supervisor.location?.map((l) => l.id),
						unionCouncils: supervisor.ucs.map((uc) => uc.id),
						wards: supervisor.wards.map((w) => w.id),
						isActive: type === "active" ? val : supervisor.isActive,
						galleryOpen:
							type === "gallery" ? val : supervisor.galleryOpen,
					},
				}),
				{
					loading: "Updating supervisor...",
					success: "Supervisor updated successfully",
					error: "Failed to update supervisor",
				}
			)
			.unwrap()
			.then(() => {
				refetchSupervisors();
			});
	};

	if (isLoading || isLocationsZonesLoading) {
		return <ApiLoading />;
	}

	if (isError || isLocationsZonesError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-semibold">Supervisors</h1>
				<Button onClick={handleOpenCreateModal}>Add Supervisor</Button>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Supervisor List</CardTitle>
					<CardDescription>
						Manage your supervisors and their details here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="text-gray-500 ">
									Full Name
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
									Address
								</TableHead>
								<TableHead className="text-gray-500 ">
									Zone
								</TableHead>
								<TableHead className="text-gray-500 ">
									Union Councils
								</TableHead>
								<TableHead className="text-gray-500 ">
									Wards
								</TableHead>
								<TableHead className="text-gray-500 ">
									Locations
								</TableHead>
								<TableHead className="text-gray-500 ">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{supervisors?.map((supervisor) => (
								<TableRow
									key={supervisor.id}
									className="border-b border-gray-200 hover:bg-gray-50 py-4"
								>
									<TableCell>{supervisor.fullName}</TableCell>
									<TableCell>{supervisor.email}</TableCell>
									<TableCell>
										{supervisor.cnicNumber}
									</TableCell>
									<TableCell>
										{supervisor.contactNumber}
									</TableCell>
									<TableCell>{supervisor.address}</TableCell>
									<TableCell>{supervisor.zoneName}</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{supervisor.ucs.map((uc) => (
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
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{supervisor.wards.map((ward) => (
												<Badge
													key={ward.id}
													variant="secondary"
													className="text-xs"
												>
													{ward.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-wrap gap-1">
											{supervisor.location?.map(
												(location) => (
													<Badge
														key={location.id}
														variant="secondary"
														className="text-xs"
													>
														{location.name}
													</Badge>
												)
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-2 items-start ">
											<div className="flex items-center space-x-2">
												<Switch
													id="gallery-open"
													checked={
														supervisor.galleryOpen
													}
													onCheckedChange={(
														val: boolean
													) =>
														onActiveUserChange(
															supervisor,
															val,
															"gallery"
														)
													}
												/>
												<Label htmlFor="gallery-open">
													App Gallery
												</Label>
											</div>
											<div className="flex items-center space-x-2">
												<Switch
													id="active-user"
													checked={
														supervisor.isActive
													}
													onCheckedChange={(
														val: boolean
													) =>
														onActiveUserChange(
															supervisor,
															val,
															"active"
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
														supervisor
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
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingItem ? "Edit Supervisor" : "Add Supervisor"}
				description={
					editingItem
						? "Make changes to the supervisor here."
						: "Add a new supervisor to the list."
				}
				customStyle="sm:max-w-[70vw]"
			>
				<div>
					<div className="grid md:grid-cols-2 grid-cols-1 gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="fullName" className="text-right">
								Full Name
							</Label>
							<Controller
								control={control}
								name="fullName"
								render={({ field }) => (
									<div className="col-span-3">
										<Input
											id="fullName"
											placeholder="Full name"
											{...field}
										/>
										{errors.fullName && (
											<p className="text-sm text-red-500 mt-1">
												{errors.fullName.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="cnicNumber">CNIC Number</Label>
							<Controller
								control={control}
								name="cnicNumber"
								render={({ field }) => (
									<div className="col-span-3">
										<Input
											id="cnicNumber"
											placeholder="CNIC number"
											{...field}
										/>
										{errors.cnicNumber && (
											<p className="text-sm text-red-500 mt-1">
												{errors.cnicNumber.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="contactNumber">
								Contact Number
							</Label>
							<Controller
								control={control}
								name="contactNumber"
								render={({ field }) => (
									<div className="col-span-3">
										<Input
											id="contactNumber"
											placeholder="Contact number"
											{...field}
										/>
										{errors.contactNumber && (
											<p className="text-sm text-red-500 mt-1">
												{errors.contactNumber.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="address">Address</Label>
							<Controller
								control={control}
								name="address"
								render={({ field }) => (
									<div className="col-span-3">
										<Input
											id="address"
											placeholder="Address"
											{...field}
										/>
										{errors.address && (
											<p className="text-sm text-red-500 mt-1">
												{errors.address.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="zone">Zone</Label>
							<Controller
								control={control}
								name="zone"
								render={({ field }) => (
									<div className="col-span-3">
										<Select
											onValueChange={(val: string) => {
												field.onChange(Number(val));
												form.setValue(
													"unionCouncils",
													[]
												);
												form.setValue("wards", []);
											}}
											value={field.value.toString()}
										>
											<SelectTrigger className="w-full h-12">
												<SelectValue placeholder="Select zone" />
											</SelectTrigger>
											<SelectContent>
												{getZoneData().map((zone) => (
													<SelectItem
														key={zone.id}
														value={zone.id}
													>
														{zone.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.zone && (
											<p className="text-sm text-red-500 mt-1">
												{errors.zone.message}
											</p>
										)}
									</div>
								)}
							/>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label className=" mt-2">Union Councils</Label>
							<div className="col-span-3 space-y-2">
								<Controller
									control={control}
									name="unionCouncils"
									render={({ field }) => (
										<MultiSelect
											options={getUnionCouncilData()}
											value={field.value}
											returnIds={true}
											onChange={(val: number[]) =>
												field.onChange(val.map(Number))
											}
											placeholder="Select Union Councils"
										/>
									)}
								/>
								{watchedUnionCouncils.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{watchedUnionCouncils.map((uc) => (
											<Badge
												key={uc}
												variant="secondary"
												className="text-xs"
											>
												{getUnionCouncilData().find(
													(ucD) =>
														Number(ucD.id) === uc
												)?.name ?? ""}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														removeItem(
															uc,
															"unionCouncils"
														)
													}
												>
													<X className="h-3 w-3" />
												</Button>
											</Badge>
										))}
									</div>
								)}
								{errors.unionCouncils && (
									<p className="text-sm text-red-500">
										{errors.unionCouncils.message}
									</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="text-right mt-2">Wards</Label>
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
											placeholder="Select Wards"
										/>
									)}
								/>
								{watchedWards.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{watchedWards.map((ward) => (
											<Badge
												key={ward}
												variant="secondary"
												className="text-xs"
											>
												{getWardData().find(
													(wardD) =>
														Number(wardD.id) ===
														Number(ward)
												)?.name ?? ""}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														removeItem(
															ward,
															"wards"
														)
													}
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
						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="text-right mt-2">Locations</Label>
							<div className="col-span-3 space-y-2">
								<Controller
									control={control}
									name="locations"
									render={({ field }) => (
										<MultiSelect
											options={getLocationData()}
											value={field.value}
											returnIds={true}
											onChange={(val: number[]) =>
												field.onChange(val.map(Number))
											}
											placeholder="Select Locations"
										/>
									)}
								/>
								{watchedLocations.length > 0 && (
									<div className="flex flex-wrap gap-1 mt-2">
										{watchedLocations.map((location) => (
											<Badge
												key={location}
												variant="secondary"
												className="text-xs"
											>
												{getLocationData().find(
													(locationD) =>
														Number(locationD.id) ===
														Number(location)
												)?.name ?? ""}
												<Button
													variant="ghost"
													size="sm"
													className="h-4 w-4 p-0 ml-1"
													onClick={() =>
														removeItem(
															location,
															"locations"
														)
													}
												>
													<X className="h-3 w-3" />
												</Button>
											</Badge>
										))}
									</div>
								)}
								{errors.locations && (
									<p className="text-sm text-red-500">
										{errors.locations.message}
									</p>
								)}
							</div>
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

export default Supervisors;
