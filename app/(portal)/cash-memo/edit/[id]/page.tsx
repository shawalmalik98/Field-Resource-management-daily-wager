"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { showSuccessToast } from "@/lib/toaster";
import { zonesApi } from "@/lib/apis";
import { useQuery } from "@tanstack/react-query";
import ApiLoading from "@/components/apiLoading";

const cashMemoSchema = z.object({
	zone: z.string().min(1, "Zone is required"),
	dateTime: z.string().min(1, "Date and time is required"),
	beatType: z.enum(["Single", "Double"], {
		required_error: "Beat type is required",
	}),
	workers: z.string().min(1, "Number of workers is required"),
	video: z.any().optional(),
	image: z.any().optional(),
});

type CashMemoForm = z.infer<typeof cashMemoSchema>;

const beatPrices = {
	"Zone A": { Single: 100, Double: 180 },
	"Zone B": { Single: 120, Double: 200 },
	"Zone C": { Single: 90, Double: 160 },
};

const EditCashMemo = () => {
	const { id } = useParams();
	const navigate = useRouter();

	const { data: zonesData, isLoading: isZonesLoading } = useQuery({
		queryKey: ["zones"],
		queryFn: () => zonesApi(),
	});

	// Mock data - in real app, fetch based on id
	const existingMemo = {
		zone: "Zone A",
		dateTime: "2024-01-15T10:30",
		beatType: "Single" as const,
		workers: "5",
	};

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CashMemoForm>({
		resolver: zodResolver(cashMemoSchema),
		defaultValues: existingMemo,
	});

	const watchedZone = watch("zone");
	const watchedBeatType = watch("beatType");
	const watchedWorkers = watch("workers");

	const calculatePrice = () => {
		if (watchedZone && watchedBeatType && watchedWorkers) {
			const pricePerWorker =
				beatPrices[watchedZone as keyof typeof beatPrices]?.[
					watchedBeatType as keyof (typeof beatPrices)["Zone A"]
				];
			if (pricePerWorker) {
				return pricePerWorker * parseInt(watchedWorkers);
			}
		}
		return 0;
	};

	const onSubmit = (data: CashMemoForm) => {
		const price = calculatePrice();
		console.log("Updated cash memo data:", { ...data, price, id });
		showSuccessToast("Cash memo updated successfully");
		navigate.replace("/cash-memo");
	};

	if (isZonesLoading) return <ApiLoading />;

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate.back()}
				>
					<ArrowLeft className="h-5 w-5" />
				</Button>
				<div>
					<h2 className="text-3xl font-bold tracking-tight">
						Edit Cash Memo
					</h2>
					<p className="text-muted-foreground">
						Update the cash memo details
					</p>
				</div>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Cash Memo Details</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="zone">Zone</Label>
								<Select
									onValueChange={(value) =>
										setValue("zone", value)
									}
									value={watchedZone}
								>
									<SelectTrigger
										className={cn(
											"w-full min-h-12",
											errors.zone && "border-red-500"
										)}
									>
										<SelectValue placeholder="Select zone" />
									</SelectTrigger>
									<SelectContent>
										{zonesData?.map((zone) => (
											<SelectItem
												key={zone.id}
												value={zone.id.toString()}
											>
												{zone.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.zone && (
									<p className="text-sm text-red-500">
										{errors.zone.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="dateTime">Date & Time</Label>
								<Input
									id="dateTime"
									type="datetime-local"
									{...register("dateTime")}
									className={
										errors.dateTime ? "border-red-500" : ""
									}
								/>
								{errors.dateTime && (
									<p className="text-sm text-red-500">
										{errors.dateTime.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="beatType">Beat Type</Label>
								<Select
									onValueChange={(value) =>
										setValue(
											"beatType",
											value as "Single" | "Double"
										)
									}
									value={watchedBeatType}
								>
									<SelectTrigger
										className={cn(
											"w-full min-h-12",
											errors.beatType && "border-red-500"
										)}
									>
										<SelectValue placeholder="Select beat type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Single">
											Single
										</SelectItem>
										<SelectItem value="Double">
											Double
										</SelectItem>
									</SelectContent>
								</Select>
								{errors.beatType && (
									<p className="text-sm text-red-500">
										{errors.beatType.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="workers">
									Number of Workers
								</Label>
								<Input
									id="workers"
									type="number"
									min="1"
									{...register("workers")}
									className={
										errors.workers ? "border-red-500" : ""
									}
								/>
								{errors.workers && (
									<p className="text-sm text-red-500">
										{errors.workers.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="video">Video Attachment</Label>
								<Input
									id="video"
									type="file"
									accept="video/*"
									className="p-0"
									{...register("video")}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="image">Image Upload</Label>
								<Input
									id="image"
									type="file"
									accept="image/*"
									className="p-0"
									{...register("image")}
								/>
							</div>
						</div>

						{/* Price Display */}
						<div className="p-4 bg-gray-50 rounded-lg">
							<div className="flex justify-between items-center">
								<span className="font-medium">
									Auto-calculated Price:
								</span>
								<span className="text-2xl font-bold text-green-600">
									${calculatePrice()}
								</span>
							</div>
						</div>

						<div className="flex justify-end space-x-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate.back()}
							>
								Cancel
							</Button>
							<Button type="submit">Update Cash Memo</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default EditCashMemo;
