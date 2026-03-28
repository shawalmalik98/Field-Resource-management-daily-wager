"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
	open: boolean;
	setOpen: (open: boolean) => void;
	onDone: (reason: string) => void;
};

export function RejectModal({ open, setOpen, onDone }: Props) {
	const [reason, setReason] = useState("");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reject Cash Memo</DialogTitle>
					<DialogDescription>
						Please enter the reason for rejecting the cash memo.
					</DialogDescription>
				</DialogHeader>
				<div className="flex items-center gap-2">
					<div className="grid flex-1 gap-2">
						<Label htmlFor="reason" className="sr-only">
							Cancel Reason
						</Label>
						<Input
							id="reason"
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter className="sm:justify-start justify-between">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
					<Button
						type="button"
						onClick={() => onDone(reason)}
						disabled={!reason}
						className={cn(
							reason
								? "bg-emerald-500 hover:bg-emerald-700"
								: "bg-gray-500 hover:bg-gray-700"
						)}
					>
						Continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
