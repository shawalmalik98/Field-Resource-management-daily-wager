import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WardsType } from "@/lib/apiTypes";
import { WardType } from "@/lib/types";

interface WardFormProps {
	initialData: WardsType | null;
	onSave: (data: WardType) => void;
	onCancel: () => void;
	isLoading: boolean;
}

const WardForm = ({
	initialData,
	onSave,
	onCancel,
	isLoading,
}: WardFormProps) => {
	const [wardName, setWardName] = useState("");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (initialData) {
			setWardName(initialData.name);
		}
	}, [initialData]);

	const validate = () => {
		if (!wardName.trim()) {
			setError("Ward name is required");
			return false;
		}
		setError("");
		return true;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (validate()) {
			onSave({
				id: initialData?.id ?? 0,
				name: wardName.trim(),
			});
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="wardName">Ward Name</Label>
				<Input
					id="wardName"
					value={wardName}
					onChange={(e) => setWardName(e.target.value)}
					placeholder="Enter ward name"
					className={error ? "border-red-500" : ""}
				/>
				{error && <p className="text-sm text-red-500">{error}</p>}
			</div>

			<div className="flex justify-end space-x-2 pt-4">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{initialData ? "Update" : "Add"} Ward
				</Button>
			</div>
		</form>
	);
};

export default WardForm;
