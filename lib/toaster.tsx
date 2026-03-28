import { toast } from "sonner";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export const showSuccessToast = (message: string, description?: string) => {
	toast.success(message, {
		description,
		icon: (
			<CheckCircleIcon
				style={{ color: "lightgreen", width: 20, height: 20 }}
			/>
		),
	});
};

export const showErrorToast = (message: string, description?: string) => {
	toast.error(message, {
		description,
		icon: <XCircleIcon style={{ color: "red", width: 20, height: 20 }} />,
	});
};

export const showApiErrorToast = (err: unknown) => {
	if (typeof err === "string") {
		toast.error(err, {
			icon: (
				<XCircleIcon style={{ color: "red", width: 20, height: 20 }} />
			),
		});
	} else {
		toast.error("Something went wrong", {
			duration: 5000,
		});
	}
};
