"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const ViewCashMemo = () => {
	const { id } = useParams();
	const navigate = useRouter();

	// Mock data - in real app, fetch based on id
	const memo = {
		id: id,
		zone: "Zone A",
		dateTime: "2024-01-15 10:30 AM",
		beatType: "Single",
		workers: 5,
		price: "$500",
		video: "video1.mp4",
		image: "image1.jpg",
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
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
							View Cash Memo
						</h2>
						<p className="text-muted-foreground">
							Cash memo details for {memo.zone}
						</p>
					</div>
				</div>
				<Button onClick={() => navigate.push(`/cash-memo/edit/${id}`)}>
					<Edit className="mr-2 h-4 w-4" />
					Edit
				</Button>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Cash Memo Details</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Zone
							</label>
							<p className="text-lg">{memo.zone}</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Date & Time
							</label>
							<p className="text-lg">{memo.dateTime}</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Beat Type
							</label>
							<p className="text-lg">{memo.beatType}</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Workers
							</label>
							<p className="text-lg">{memo.workers}</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Price
							</label>
							<p className="text-lg font-semibold text-green-600">
								{memo.price}
							</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Video
							</label>
							<p className="text-lg">{memo.video}</p>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">
								Image
							</label>
							<p className="text-lg">{memo.image}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ViewCashMemo;
