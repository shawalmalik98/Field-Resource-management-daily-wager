"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccessToast } from "@/lib/toaster";
import { resetPasswordApi } from "@/lib/apis";
import { resetPasswordSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useUserStore from "@/state/userState";

type Props = object;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordPage({}: Props) {
	const { user } = useUserStore();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { isPending, mutateAsync } = useMutation<
		boolean,
		null,
		ResetPasswordForm
	>({
		mutationKey: ["login"],
		mutationFn: (data: ResetPasswordForm) =>
			resetPasswordApi(Number(user?.id), data.confirmPassword),
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordForm) => {
		const result = await mutateAsync(data);
		if (result) {
			reset({
				password: "",
				confirmPassword: "",
			});
			showSuccessToast("Password reset successfully");
		}
	};

	return (
		<div className="min-h-[80vh] flex items-center justify-center p-8 bg-gray-50">
			<Card className="w-full max-w-4xl shadow-lg border-none py-7">
				<CardHeader className="pb-10">
					<CardTitle className="text-2xl font-bold text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center">
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<div className="space-y-2">
							<Label htmlFor="password">New Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your new password"
									{...register("password")}
									className={
										errors.password
											? "border-red-500 pr-10"
											: "pr-10"
									}
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="text-sm text-red-500">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm New Password
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									placeholder="Confirm your new password"
									{...register("confirmPassword")}
									className={
										errors.confirmPassword
											? "border-red-500 pr-10"
											: "pr-10"
									}
								/>
								<button
									type="button"
									onClick={() =>
										setShowConfirmPassword(
											!showConfirmPassword
										)
									}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{errors.confirmPassword && (
								<p className="text-sm text-red-500">
									{errors.confirmPassword.message}
								</p>
							)}
						</div>

						<Button
							type="submit"
							className="w-full"
							disabled={isPending}
						>
							{isPending
								? "Changing Password..."
								: "Change Password"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default ResetPasswordPage;
