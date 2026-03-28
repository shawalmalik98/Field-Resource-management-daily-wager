import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import React from "react";

type Props = {
	className?: string;
};

function Loading({ className }: Props) {
	return <LoaderCircle className={cn("h-4 w-4 animate-spin", className)} />;
}

export default Loading;
