"use client";

import React, { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Loading from "./loading";

type Props = {
	onDone: () => Promise<void>;
	open: boolean;
	close: () => void;
};

function AlertBox({ close, open, onDone }: Props) {
	const [isLoading, setIsLoading] = useState(false);

	return (
		<AlertDialog open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel
						className="cursor-pointer"
						onClick={() => {
							if (!isLoading) {
								close();
							}
						}}
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="cursor-pointer"
						onClick={async () => {
							setIsLoading(true);
							await onDone();
							setIsLoading(false);

							close();
						}}
					>
						{isLoading ? <Loading /> : "Continue"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default AlertBox;
