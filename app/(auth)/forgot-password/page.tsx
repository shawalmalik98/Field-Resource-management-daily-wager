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
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { forgetPasswordApi } from "@/lib/apis";
import Image from "next/image";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
	const [emailSent, setEmailSent] = useState(false);

	const { isPending, mutateAsync } = useMutation<
		boolean,
		null,
		ForgotPasswordForm
	>({
		mutationKey: ["login"],
		mutationFn: (data: ForgotPasswordForm) => forgetPasswordApi(data.email),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		getValues,
	} = useForm<ForgotPasswordForm>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordForm) => {
		const result = await mutateAsync(data);
		if (result) {
			setEmailSent(true);
		}
	};

	return (
		<Card className="min-w-screen w-full min-h-screen max-w-4xl shadow-lg border-none p-0 z-10">
			<div className="grid grid-cols-1 md:grid-cols-3 flex-1 ">
				{/* Left side - Forgot Password form */}
				<div className="md:px-8 px-2 content-center">
					<CardHeader className="space-y-1 pb-10">
						<CardTitle className="flex flex-col items-center justify-center space-y-6">
							<div className="w-full h-[50px] relative">
								<Image
									src="/logo.png"
									alt="Aysis International"
									fill
									className=" object-contain"
								/>
							</div>
							<span className="text-2xl font-bold text-center">
								{emailSent
									? "Check Your Email"
									: "Forgot Password"}
							</span>
						</CardTitle>
						<CardDescription className="text-center">
							{emailSent
								? `We've sent password reset instructions to ${getValues(
										"email"
								  )}`
								: "Enter your email address and we'll send you a link to reset your password"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{!emailSent ? (
							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
										<Input
											id="email"
											type="email"
											placeholder="Enter your email address"
											{...register("email")}
											className={
												errors.email
													? "border-red-500 pl-10"
													: "pl-10"
											}
										/>
									</div>
									{errors.email && (
										<p className="text-sm text-red-500">
											{errors.email.message}
										</p>
									)}
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isPending}
								>
									{isPending
										? "Sending..."
										: "Send Reset Link"}
								</Button>
							</form>
						) : (
							<div className="space-y-4">
								<div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
									<div className="text-green-800 space-y-1.5">
										<div className="font-bold">
											Password Set to = 12345678
										</div>
										<div className="text-sm">
											Please login with the new password
										</div>
									</div>
								</div>
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
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Login
							</Button>
						</Link>
					</CardContent>
				</div>

				{/* Right side - Image */}
				<div className="hidden md:block relative overflow-hidden  col-span-2">
					<Image
						src="/login-img1.jpg"
						alt="Login Image"
						className="w-full h-full object-cover"
						fill
					/>
					<div className="absolute inset-0 bg-gradient-to-br from-black-600/80 to-black-600/20" />
				</div>
			</div>
		</Card>
	);
};

export default ForgotPassword;
