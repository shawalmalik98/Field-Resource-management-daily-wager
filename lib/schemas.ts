import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z
		.string({
			required_error: "Password is required",
		})
		.min(8, { message: "Password must be at least 8 characters." }),
});

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export const forgotPasswordSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
});

// Portal Schemas

export const supervisorSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters."),
	cnicNumber: z.string().min(13, "CNIC must be at least 13 characters."),
	contactNumber: z
		.string()
		.min(10, "Contact number must be at least 10 characters."),
	address: z.string().min(5, "Address must be at least 5 characters."),
	zone: z.number().min(1, "Zone is required."),
	unionCouncils: z
		.array(z.number())
		.min(1, "At least one Union Council must be selected."),
	wards: z.array(z.number()).min(1, "At least one Ward must be selected."),
	locations: z
		.array(z.number())
		.min(1, "At least one Location must be selected."),
	email: z
		.string()
		.email({ message: "Please enter a valid email address." })
		.optional()
		.nullable()
		.or(z.literal("")),
	isActive: z.boolean().optional().nullable(),
});

export const contractorSchema = z.object({
	fullName: z
		.string()
		.min(2, { message: "Full name must be at least 2 characters." }),
	cnicNumber: z
		.string()
		.min(13, { message: "CNIC number must be at least 13 characters." }),
	zones: z.array(z.number()).min(1, "At least one Zone must be selected."),
	contactNumber: z
		.string()
		.min(10, { message: "Contact number must be at least 10 characters." }),
	address: z
		.string()
		.min(5, { message: "Address must be at least 5 characters." }),
	morningPrice: z
		.number()
		.min(0, { message: "Morning price must be non-negative." }),
	nightPrice: z
		.number()
		.min(0, { message: "Night price must be non-negative." }),
	eveningPrice: z
		.number()
		.min(0, { message: "Evening price must be non-negative." }),
});

export const departmentSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Department name must be at least 2 characters." }),
});

export const designationSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Designation name must be at least 2 characters." }),
	departmentIds: z
		.array(z.number())
		.min(1, { message: "At least one department must be selected." }),
});

export const employeeSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Employee name must be at least 2 characters." }),
	fatherName: z
		.string()
		.min(2, { message: "Father name must be at least 2 characters." }),
	cnic: z
		.string()
		.min(13, { message: "CNIC must be at least 13 characters." }),
	contactNo: z
		.string()
		.min(10, { message: "Contact number must be at least 10 characters." }),
	designation: z
		.number()
		.min(1, { message: "Designation must be selected." }),
	department: z.number().min(1, { message: "Department must be selected." }),
	joiningDate: z.date({ required_error: "Joining date is required." }),
	zoneId: z.number(),
	email: z
		.string()
		.email({ message: "Please enter a valid email address." })
		.optional()
		.nullable()
		.or(z.literal("")),
	isActive: z.boolean().optional().nullable(),
});

export const locationSchema = z.object({
	name: z.string().min(2, {
		message: "Location name must be at least 2 characters.",
	}),
	longitude: z.number(),
	latitude: z.number(),
	radius: z.number().min(0, {
		message: "Radius must be a non-negative number.",
	}),
});

export const zoneSchema = z.object({
	name: z.string().min(2, {
		message: "Zone name must be at least 2 characters.",
	}),
	ucNames: z.array(z.string()).min(1, {
		message: "At least one UC selection is required.",
	}),
});

export enum Shift {
	MORNING = "MORNING",
	NIGHT = "NIGHT",
	EVENING = "EVENING",
}

export const cashMemoSchema = z.object({
	zoneId: z.number(),
	ucId: z.number(),
	wards: z.array(
		z.object({
			wardId: z.number(),
			singleWorkers: z.number().min(1, {
				message: "Single workers must be a non-negative number.",
			}),
			doubleWorkers: z
				.number()
				.min(0, {
					message: "Double workers must be a non-negative number.",
				})
				.optional()
				.nullable(),
			labourDeducted: z
				.number()
				.min(0, {
					message: "Labour deducted must be a non-negative number.",
				})
				.optional()
				.nullable(),
			wardName: z.string().optional().nullable(),
			id: z.number().optional().nullable(),
		})
	),
	contractorId: z.number(),
	shift: z.nativeEnum(Shift),
	totalAmount: z.number().min(0, {
		message: "Total amount must be a non-negative number.",
	}),
	deployDate: z.date(),
	videoUrl: z.string(),
});
