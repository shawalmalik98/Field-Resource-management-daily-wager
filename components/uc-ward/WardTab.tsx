import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import FormModal from "../FormModal";
import WardForm from "./WardForm";
import { Card } from "../ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addWardApi,
	deleteWardApi,
	ucWardsApi,
	updateWardApi,
} from "@/lib/apis";
import ApiError from "../apiError";
import ApiLoading from "../apiLoading";
import { WardsType } from "@/lib/apiTypes";
import { showSuccessToast } from "@/lib/toaster";
import { WardType } from "@/lib/types";

const WardTab = () => {
	const {
		data: ucsData,
		isLoading: isUcLoading,
		isError: isUcError,
	} = useQuery({
		queryKey: ["ucswards"],
		queryFn: ucWardsApi,
	});

	const queryClient = useQueryClient();

	const { mutateAsync: addWard, isPending: isAddWardPending } = useMutation({
		mutationKey: ["addWard"],
		mutationFn: addWardApi,
		onSuccess: () => {
			showSuccessToast("Ward added successfully");
			queryClient.invalidateQueries({ queryKey: ["ucswards"] });
		},
	});

	const { mutateAsync: updateWard, isPending: isUpdateWardPending } =
		useMutation({
			mutationKey: ["updateWard"],
			mutationFn: (wardData: WardType) =>
				updateWardApi(wardData.id, wardData),
			onSuccess: () => {
				showSuccessToast("Ward updated successfully");
				queryClient.invalidateQueries({ queryKey: ["ucswards"] });
			},
		});

	const { mutateAsync: deleteWard, isPending: isDeleteWardPending } =
		useMutation({
			mutationKey: ["deleteWard"],
			mutationFn: deleteWardApi,
			onSuccess: () => {
				showSuccessToast("Ward deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["ucswards"] });
			},
		});

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingWard, setEditingWard] = useState<WardsType | null>(null);

	const handleAdd = () => {
		setEditingWard(null);
		setIsModalOpen(true);
	};

	const handleEdit = (ward: WardsType) => {
		setEditingWard(ward);
		setIsModalOpen(true);
	};

	const handleDelete = async (id: number) => {
		await deleteWard(id);
	};

	const handleSave = async (wardData: WardType) => {
		if (editingWard) {
			const result = await updateWard(wardData);
			if (result) {
				setIsModalOpen(false);
			}
		} else {
			const result = await addWard(wardData);
			if (result) {
				setIsModalOpen(false);
			}
		}
	};

	if (isUcLoading) {
		return <ApiLoading />;
	}

	if (isUcError) {
		return <ApiError />;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center py-4">
				<h3 className="text-lg font-semibold">Wards</h3>
				<Button onClick={handleAdd}>
					<Plus className="mr-2 h-4 w-4" />
					Add Ward
				</Button>
			</div>

			<Card className="border-none px-4">
				<Table>
					<TableHeader>
						<TableRow className="h-14 ">
							<TableHead className=" text-gray-500 border-b border-gray-200">
								ID
							</TableHead>
							<TableHead className="text-gray-500 border-b border-gray-200">
								Ward Name
							</TableHead>
							<TableHead className="text-right text-gray-500 border-b border-gray-200">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ucsData?.wards.map((ward) => (
							<TableRow
								key={ward.id}
								className="border-b border-gray-200 hover:bg-gray-50 "
							>
								<TableCell>{ward.id}</TableCell>
								<TableCell className="font-medium">
									{ward.name}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end space-x-2">
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-card-foreground hover:text-white"
											onClick={() => handleEdit(ward)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-card-foreground hover:text-white"
											onClick={() =>
												handleDelete(ward.id)
											}
											disabled={isDeleteWardPending}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			<FormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				title={editingWard ? "Edit Ward" : "Add Ward"}
				description="Enter the ward details below."
			>
				<WardForm
					initialData={editingWard}
					onSave={handleSave}
					onCancel={() => setIsModalOpen(false)}
					isLoading={isAddWardPending || isUpdateWardPending}
				/>
			</FormModal>
		</div>
	);
};

export default WardTab;
