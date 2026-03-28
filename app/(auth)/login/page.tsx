"use client";
/* eslint-disable @next/next/no-img-element */
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
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { showSuccessToast } from "@/lib/toaster";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { loginUserApi } from "@/lib/apis";
import { LoginResponse } from "@/lib/apiTypes";
import Image from "next/image";

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
	const router = useRouter();

	const [showPassword, setShowPassword] = useState(false);

	const { isPending, mutateAsync } = useMutation<
		LoginResponse | null,
		null,
		LoginForm
	>({
		mutationKey: ["login"],
		mutationFn: (data: LoginForm) =>
			loginUserApi(data.email, data.password),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginForm) => {
		const result = await mutateAsync(data);

		if (result) {
			localStorage.setItem("wager_token", result.token);

			showSuccessToast(
				"Welcome back!",
				"You have successfully logged in."
			);
			router.replace("/dashboard");
		}
	};

	return (
		<Card className="min-w-screen w-full min-h-screen max-w-4xl shadow-lg border-none p-0 z-10">
			<div className="grid grid-cols-1 md:grid-cols-3 flex-1 ">
				{/* Left side - Login form */}
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
								Login
							</span>
						</CardTitle>
						<CardDescription className="text-center">
							Enter your credentials to access your account
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="admin@example.com"
									{...register("email")}
									className={
										errors.email ? "border-red-500" : ""
									}
								/>
								{errors.email && (
									<p className="text-sm text-red-500">
										{errors.email.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<div className="relative">
									<Input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Enter your password"
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

							<div className="flex justify-end">
								<Link
									href="/forgot-password"
									className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
								>
									Forgot your password?
								</Link>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={isPending}
							>
								{isPending ? "Signing in..." : "Sign in"}
							</Button>
						</form>
					</CardContent>
				</div>

				{/* Right side - Image */}
				<div className="hidden md:block relative overflow-hidden  col-span-2">
					<Image
						src="/login-img.jpg"
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

export default Login;
