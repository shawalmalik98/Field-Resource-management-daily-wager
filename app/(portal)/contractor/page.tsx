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

import { Edit, X } from "lucide-react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { showSuccessToast } from "@/lib/toaster";
import { contractorSchema } from "@/lib/schemas";
import FormModal from "@/components/FormModal";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
	addContractorApi,
	contractorApi,
	updateContractorApi,
	zonesApi,
} from "@/lib/apis";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { ContractorsResponse } from "@/lib/apiTypes";
import MultiSelect from "@/components/MultiSelect";
import { Badge } from "@/components/ui/badge";

type ContractorFormData = z.infer<typeof contractorSchema>;

const Contractors = () => {
	const queryClient = useQueryClient();

	const {
		data: zones,
		isLoading: isZonesLoading,
		isSuccess: isZonesSuccess,
		isError: isZonesError,
	} = useQuery({
		queryKey: ["zones"],
		queryFn: zonesApi,
	});

	const {
		data: contractors,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["contractors"],
		queryFn: contractorApi,
		enabled: isZonesSuccess,
	});

	const { mutateAsync: addContractor, isPending: isAdding } = useMutation({
		mutationKey: ["addContractor"],
		mutationFn: addContractorApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contractors"] });
		},
	});

	const { mutateAsync: updateContractor, isPending: isUpdating } =
		useMutation({
			mutationKey: ["updateContractor"],
			mutationFn: ({
				id,
				data,
			}: {
				id: number;
				data: ContractorFormData & { isActive: boolean };
			}) => updateContractorApi(id, data),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["contractors"] });
			},
		});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ContractorsResponse | null>(
		null
	);

	const form = useForm<ContractorFormData>({
		resolver: zodResolver(contractorSchema),
		defaultValues: {
			fullName: "",
			cnicNumber: "",
			zones: [],
			contactNumber: "",
			address: "",
			morningPrice: 0,
			nightPrice: 0,
			eveningPrice: 0,
		},
		mode: "onChange",
	});

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = form;

	const selectedZones = form.watch("zones");

	const onSubmit = (data: ContractorFormData) => {
		if (editingItem) {
			handleEdit(editingItem, data);
		} else {
			handleCreate(data);
		}
	};

	const handleCreate = async (data: ContractorFormData) => {
		const result = await addContractor(data);
		if (result) {
			setIsModalOpen(false);
			reset();
			showSuccessToast("Contractor added successfully.");
		}
	};

	const handleEdit = async (
		item: ContractorsResponse,
		data: ContractorFormData
	) => {
		const result = await updateContractor({
			id: item.id,
			data: { ...data, isActive: item.isActive },
		});
		if (result) {
			setIsModalOpen(false);
			setEditingItem(null);
			reset();
			showSuccessToast("Contractor updated successfully.");
		}
	};

	const getFormData = (item: ContractorsResponse) => {
		return {
			fullName: item.fullName,
			cnicNumber: item.cnicNumber,
			zones: item.zones.map((zone) => zone.id),
			contactNumber: item.contactNumber,
			address: item.address,
			morningPrice: item.morningPrice,
			nightPrice: item.nightPrice,
			eveningPrice: item.eveningPrice,
		};
	};

	const handleOpenEditModal = (item: ContractorsResponse) => {
		setEditingItem(item);

		form.reset(getFormData(item));
		setIsModalOpen(true);
	};

	const handleOpenCreateModal = () => {
		setEditingItem(null);
		form.reset();
		setIsModalOpen(true);
	};

	const onActiveUserChange = (
		data: ContractorsResponse,
		checked: boolean
	) => {
		toast.promise(
			updateContractor({
				id: data.id,
				data: {
					...getFormData(data),
					isActive: checked,
				},
			}),
			{
				loading: "Updating contractor status...",
				success: "Contractor status updated successfully",
				error: "Failed to update contractor status",
			}
		);
	};

	const removeZoneField = (index: number) => {
		if (selectedZones.length == 0) return;

		form.setValue(
			"zones",
			selectedZones.filter((_, i) => i !== index)
		);
	};

	if (isLoading || isZonesLoading) {
		return <ApiLoading />;
	}

	if (isError || isZonesError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4 flex justify-between">
				<h1 className="text-2xl font-semibold">Contractors</h1>
				<Button onClick={handleOpenCreateModal}>Add Contractor</Button>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Contractor List</CardTitle>
					<CardDescription>
						Manage your contractors and their details here.
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
									CNIC
								</TableHead>
								<TableHead className="text-gray-500 ">
									Zone
								</TableHead>
								<TableHead className="text-gray-500 ">
									Contact
								</TableHead>
								<TableHead className="text-gray-500 ">
									Address
								</TableHead>
								<TableHead className="text-gray-500 ">
									Morning
								</TableHead>
								<TableHead className="text-gray-500 ">
									Evening
								</TableHead>
								<TableHead className="text-gray-500 ">
									Night
								</TableHead>
								<TableHead className="text-gray-500  text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{contractors?.map((contractor) => (
								<TableRow
									key={contractor.id}
									className="border-b border-gray-200 hover:bg-gray-50 py-4"
								>
									<TableCell className="font-medium">
										{contractor.fullName}
									</TableCell>
									<TableCell>
										{contractor.cnicNumber}
									</TableCell>
									<TableCell>
										{contractor.zones
											.map((zone) => zone.name)
											.join(", ")}
									</TableCell>
									<TableCell>
										{contractor.contactNumber}
									</TableCell>
									<TableCell className="max-w-[200px] truncate">
										{contractor.address}
									</TableCell>
									<TableCell>
										Rs. {contractor.morningPrice}
									</TableCell>
									<TableCell>
										Rs. {contractor.eveningPrice}
									</TableCell>
									<TableCell>
										Rs. {contractor.nightPrice}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex flex-col gap-2 items-end ">
											<div className="flex items-center space-x-2">
												<Switch
													id="active-user"
													defaultChecked
													onCheckedChange={(
														val: boolean
													) =>
														onActiveUserChange(
															contractor,
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
														contractor
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
									{contractors?.length} contractor(s) in total
								</TableCell>
							</TableRow>
						</TableFooter>
					</Table>
				</CardContent>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingItem ? "Edit Contractor" : "Add Contractor"}
				description={
					editingItem
						? "Make changes to your contractor here. Click save when you're done."
						: "Add a new contractor to the list. Click save when you're done."
				}
				customStyle="sm:max-w-[70vw]"
			>
				<div>
					<div className="grid md:grid-cols-2 grid-cols-1 gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="fullName">Full Name</Label>
							<Controller
								control={control}
								name="fullName"
								render={({ field }) => (
									<Input
										id="fullName"
										placeholder="Full name"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.fullName && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.fullName.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="cnicNumber">CNIC Number</Label>
							<Controller
								control={control}
								name="cnicNumber"
								render={({ field }) => (
									<Input
										id="cnicNumber"
										placeholder="1234567890123"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.cnicNumber && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.cnicNumber.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4 w-full">
							<Label htmlFor="zone">Zone</Label>
							<div className="col-span-3">
								<MultiSelect
									options={
										zones?.map((zone) => ({
											id: zone.id.toString(),
											name: zone.name,
										})) ?? []
									}
									value={form.getValues("zones")}
									returnIds={true}
									onChange={(value) =>
										form.setValue(
											"zones",
											value.map(Number)
										)
									}
									placeholder="Select Zones"
								/>
							</div>

							{selectedZones.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2 col-span-3">
									{selectedZones.map((z, i) => (
										<Badge
											key={`zones-${z}`}
											variant="secondary"
											className="text-xs"
										>
											{zones?.find(
												(zone) => zone.id === Number(z)
											)?.name ?? ""}
											<Button
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0 ml-1"
												onClick={() =>
													removeZoneField(i)
												}
											>
												<X className="h-3 w-3" />
											</Button>
										</Badge>
									))}
								</div>
							)}

							{errors.zones && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.zones.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="contactNumber">
								Contact Number
							</Label>
							<Controller
								control={control}
								name="contactNumber"
								render={({ field }) => (
									<Input
										id="contactNumber"
										placeholder="03001234567"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.contactNumber && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.contactNumber.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="address">Address</Label>
							<Controller
								control={control}
								name="address"
								render={({ field }) => (
									<Input
										id="address"
										placeholder="Complete address"
										className="col-span-3"
										{...field}
									/>
								)}
							/>
							{errors.address && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.address.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="morningPrice">Morning Price</Label>
							<Controller
								control={control}
								name="morningPrice"
								render={({ field }) => (
									<Input
										id="morningPrice"
										type="number"
										placeholder="0"
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
							{errors.morningPrice && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.morningPrice.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="eveningPrice">Evening Price</Label>
							<Controller
								control={control}
								name="eveningPrice"
								render={({ field }) => (
									<Input
										id="eveningPrice"
										type="number"
										placeholder="0"
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
							{errors.eveningPrice && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.eveningPrice.message}
								</p>
							)}
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="nightPrice">Night Price</Label>
							<Controller
								control={control}
								name="nightPrice"
								render={({ field }) => (
									<Input
										id="nightPrice"
										type="number"
										placeholder="0"
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
							{errors.nightPrice && (
								<p className="text-red-500 col-span-3 text-sm">
									{errors.nightPrice.message}
								</p>
							)}
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

export default Contractors;
