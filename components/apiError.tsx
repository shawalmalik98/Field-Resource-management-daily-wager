import { cn } from "@/lib/utils";
import React from "react";

type Props = {
	className?: string;
};

function ApiError({ className }: Props) {
	return (
		<div className="flex items-center justify-center h-screen">
			<span className={cn("text-red-500 font-medium", className)}>
				Error fetching dashboard data
			</span>
		</div>
	);
}

export default ApiError;
