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
import UCForm from "./UCForm";
import { Card } from "../ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addUcApi, deleteUcApi, ucWardsApi, updateUcApi } from "@/lib/apis";
import ApiLoading from "../apiLoading";
import ApiError from "../apiError";
import { unionCouncilType } from "@/lib/apiTypes";
import { UnionCouncilType } from "@/lib/types";
import { showSuccessToast } from "@/lib/toaster";

const UCTab = () => {
	const queryClient = useQueryClient();
	const {
		data: ucsData,
		isLoading: isUcLoading,
		isError: isUcError,
	} = useQuery({
		queryKey: ["ucswards"],
		queryFn: ucWardsApi,
	});

	const { mutateAsync: addUc, isPending: isAddUcPending } = useMutation({
		mutationKey: ["addUc"],
		mutationFn: addUcApi,
		onSuccess: () => {
			showSuccessToast("UC added successfully");
			queryClient.invalidateQueries({ queryKey: ["ucswards"] });
		},
	});

	const { mutateAsync: updateUc, isPending: isUpdateUcPending } = useMutation(
		{
			mutationKey: ["updateUc"],
			mutationFn: (ucData: UnionCouncilType) =>
				updateUcApi(ucData.id, ucData),
			onSuccess: () => {
				showSuccessToast("UC updated successfully");
				queryClient.invalidateQueries({ queryKey: ["ucswards"] });
			},
		}
	);

	const { mutateAsync: deleteUc, isPending: isDeleteUcPending } = useMutation(
		{
			mutationKey: ["deleteUc"],
			mutationFn: deleteUcApi,
			onSuccess: () => {
				showSuccessToast("UC deleted successfully");
				queryClient.invalidateQueries({ queryKey: ["ucswards"] });
			},
		}
	);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUC, setEditingUC] = useState<unionCouncilType | null>(null);

	const handleAdd = () => {
		setEditingUC(null);
		setIsModalOpen(true);
	};

	const handleEdit = (uc: unionCouncilType) => {
		setEditingUC(uc);
		setIsModalOpen(true);
	};

	const handleDelete = async (id: number) => {
		await deleteUc(id);
	};

	const handleSave = async (ucData: UnionCouncilType) => {
		if (editingUC) {
			const result = await updateUc(ucData);
			if (result) {
				setIsModalOpen(false);
			}
		} else {
			const result = await addUc(ucData);
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
				<h3 className="text-lg font-semibold">Union Councils</h3>
				<Button onClick={handleAdd}>
					<Plus className="mr-2 h-4 w-4" />
					Add UC
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
								UC Name
							</TableHead>
							<TableHead className="text-gray-500 border-b border-gray-200">
								Wards
							</TableHead>
							<TableHead className="text-right text-gray-500 border-b border-gray-200">
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ucsData?.ucs.map((uc) => (
							<TableRow
								key={uc.id}
								className="border-b border-gray-200 hover:bg-gray-50 "
							>
								<TableCell>{uc.id}</TableCell>
								<TableCell className="font-medium">
									{uc.name}
								</TableCell>
								<TableCell>
									{uc.wards
										.map((ward) => ward.name)
										.join(", ")}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end space-x-2">
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-card-foreground hover:text-white"
											onClick={() => handleEdit(uc)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="hover:bg-card-foreground hover:text-white"
											onClick={() => handleDelete(uc.id)}
											disabled={isDeleteUcPending}
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
				title={editingUC ? "Edit UC" : "Add UC"}
				description="Enter the UC details below."
			>
				<UCForm
					initialData={editingUC}
					onSave={handleSave}
					onCancel={() => setIsModalOpen(false)}
					apiData={ucsData}
					isLoading={isAddUcPending || isUpdateUcPending}
				/>
			</FormModal>
		</div>
	);
};

export default UCTab;
