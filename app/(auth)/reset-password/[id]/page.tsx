"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { showSuccessToast } from "@/lib/toaster";
import { resetPasswordSchema } from "@/lib/schemas";
import { resetPasswordApi } from "@/lib/apis";
import { useMutation } from "@tanstack/react-query";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
	const { id } = useParams();

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);

	const { isPending, mutateAsync } = useMutation<
		boolean,
		null,
		ResetPasswordForm
	>({
		mutationKey: ["login"],
		mutationFn: (data: ResetPasswordForm) =>
			resetPasswordApi(Number(id), data.confirmPassword),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordForm>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordForm) => {
		const result = await mutateAsync(data);
		if (result) {
			setPasswordChanged(true);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
			<Card className="w-full max-w-4xl shadow-lg border-none p-0">
				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* Left side - Reset Password form */}
					<div className="px-8 py-14">
						<CardHeader className="pb-10">
							<CardTitle className="text-2xl font-bold text-center">
								{passwordChanged
									? "Password Changed!"
									: "Reset Password"}
							</CardTitle>
							<CardDescription className="text-center">
								{passwordChanged
									? "Your password has been successfully changed. Redirecting to login..."
									: "Enter your new password below"}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{!passwordChanged ? (
								<form
									onSubmit={handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<div className="space-y-2">
										<Label htmlFor="password">
											New Password
										</Label>
										<div className="relative">
											<Input
												id="password"
												type={
													showPassword
														? "text"
														: "password"
												}
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
													setShowPassword(
														!showPassword
													)
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
							) : (
								<div className="space-y-4">
									<div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
										<CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
										<div className="text-green-800">
											<div className="font-medium mb-2">
												Password successfully changed!
											</div>
											<div className="text-sm">
												You will be redirected to the
												login page shortly.
											</div>
										</div>
									</div>

									<Link href="/login" className="block">
										<Button className="w-full">
											Go to Login Now
										</Button>
									</Link>
								</div>
							)}

							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">
										Or
									</span>
								</div>
							</div>

							<Link href="/login" className="block">
								<Button variant="ghost" className="w-full">
									Back to Login
								</Button>
							</Link>
						</CardContent>
					</div>

					{/* Right side - Image */}
					<div className="hidden md:block relative overflow-hidden rounded-r-lg">
						<img
							src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
							alt="Reset password illustration"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
					</div>
				</div>
			</Card>
		</div>
	);
};

export default ResetPassword;
