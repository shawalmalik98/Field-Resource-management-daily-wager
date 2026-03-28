import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import MultiSelect from "../MultiSelect";
import { Badge } from "../ui/badge";
import { unionCouncilType, UCWardsResponse } from "@/lib/apiTypes";
import { MultiSelectOption, UnionCouncilType } from "@/lib/types";

interface UCFormProps {
	initialData: unionCouncilType | null;
	apiData: UCWardsResponse | null | undefined;
	onSave: (data: UnionCouncilType) => void;
	onCancel: () => void;
	isLoading: boolean;
}

const UCForm = ({
	initialData,
	onSave,
	onCancel,
	apiData,
	isLoading,
}: UCFormProps) => {
	const [ucName, setUcName] = useState("");
	const [selectedWards, setSelectedWards] = useState<string[]>([]);
	const [errors, setErrors] = useState<{ ucName?: string; wards?: string }>(
		{}
	);

	useEffect(() => {
		if (initialData) {
			setUcName(initialData.name);
			setSelectedWards(
				initialData.wards?.length > 0
					? initialData.wards.map((ward) => ward.id.toString())
					: [""]
			);
		}
	}, [initialData]);

	const removeWardField = (index: number) => {
		if (selectedWards.length == 0) return;

		setSelectedWards(selectedWards.filter((_, i) => i !== index));
	};

	const updateWard = (values: string[]) => {
		setSelectedWards(values);
	};

	const validate = () => {
		const newErrors: { ucName?: string; wards?: string } = {};

		if (!ucName.trim()) {
			newErrors.ucName = "UC name is required";
		}

		const filledWards = selectedWards.filter((ward) => ward.trim());
		if (filledWards.length === 0) {
			newErrors.wards = "At least one ward is required";
		}

		// Check for duplicate ward selections
		const uniqueWards = new Set(filledWards);
		if (uniqueWards.size !== filledWards.length) {
			newErrors.wards = "Duplicate ward selections are not allowed";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (validate()) {
			onSave({
				id: initialData?.id ?? 0,
				name: ucName.trim(),
				wards: selectedWards.map(Number),
			});
		}
	};

	const getWardOptions = useMemo(() => {
		const data: MultiSelectOption[] = [];

		for (const ward of apiData?.wards || []) {
			data.push({
				id: ward.id.toString(),
				name: ward.name,
			});
		}

		return data;
	}, [apiData]);

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="ucName">UC Name</Label>
				<Input
					id="ucName"
					value={ucName}
					onChange={(e) => setUcName(e.target.value)}
					placeholder="Enter UC name"
					className={errors.ucName ? "border-red-500" : ""}
				/>
				{errors.ucName && (
					<p className="text-sm text-red-500">{errors.ucName}</p>
				)}
			</div>

			<div className="space-y-2">
				<Label>Wards</Label>
				<MultiSelect
					options={getWardOptions}
					value={selectedWards}
					returnIds={true}
					onChange={(value) => updateWard(value)}
					placeholder="Select Wards"
				/>
				{selectedWards.length > 0 && (
					<div className="flex flex-wrap gap-1 mt-2">
						{selectedWards.map((uc, i) => (
							<Badge
								key={uc}
								variant="secondary"
								className="text-xs"
							>
								{getWardOptions.find((ward) => ward.id === uc)
									?.name ?? ""}
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 ml-1"
									onClick={() => removeWardField(i)}
								>
									<X className="h-3 w-3" />
								</Button>
							</Badge>
						))}
					</div>
				)}
				{errors.wards && (
					<p className="text-sm text-red-500">{errors.wards}</p>
				)}
			</div>

			<div className="flex justify-end space-x-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{initialData ? "Update" : "Add"} UC
				</Button>
			</div>
		</form>
	);
};

export default UCForm;
