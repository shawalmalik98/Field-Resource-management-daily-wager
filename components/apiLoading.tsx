import { cn } from "@/lib/utils";
import React from "react";
import Loading from "./loading";

type Props = {
	className?: string;
};

function ApiLoading({ className }: Props) {
	return (
		<div
			className={cn(
				"flex items-center justify-center h-screen",
				className
			)}
		>
			<Loading className="w-10 h-10" />
		</div>
	);
}

export default ApiLoading;
