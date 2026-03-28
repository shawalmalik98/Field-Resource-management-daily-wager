import { ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: ReactNode;
	customStyle?: string;
}

const FormModal = ({
	open,
	onOpenChange,
	title,
	description,
	children,
	customStyle,
}: FormModalProps) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"sm:max-w-md max-h-[90vh] overflow-y-auto",
					customStyle
				)}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && (
						<DialogDescription>{description}</DialogDescription>
					)}
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
};

export default FormModal;
