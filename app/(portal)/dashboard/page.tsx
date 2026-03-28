"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Area,
	AreaChart,
} from "recharts";

import { summaryData } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/apis";
import ApiError from "@/components/apiError";
import ApiLoading from "@/components/apiLoading";
import SupervisorMap from "@/components/supervisorMap";
import useUserStore from "@/state/userState";

const Dashboard = () => {
	const { user } = useUserStore();
	const {
		data: dashboardData,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["dashboard"],
		queryFn: dashboardApi,
	});

	if (isLoading) return <ApiLoading />;
	if (isError) return <ApiError />;

	const getCardValue = (id: number) => {
		switch (id) {
			case 1:
				return `Rs.${dashboardData?.totalCash}`;
			case 2:
				return dashboardData?.totalSupervisors;
			case 3:
				return dashboardData?.totalZones;
			case 4:
				return dashboardData?.totalEmployees;
		}
	};

	return (
		<div className="space-y-6 p-4 max-w-7xl mx-auto">
			{/* Header Section */}
			<div className="flex flex-col gap-1">
				<span className="text-xl md:text-3xl font-bold  bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent">
					Dashboard Overview
				</span>
				<span className="text-base md:text-lg text-muted-foreground">
					Welcome back! Here`s what`s happening with your business
					today.
				</span>
			</div>

			{/* Summary Cards */}
			{(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
				<div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
					{summaryData.map((item, index) => {
						const Icon = item.icon;
						return (
							<Card
								key={index}
								className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
								<CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
									<div className="space-y-1">
										<CardTitle className="text-sm font-medium text-gray-600">
											{item.title}
										</CardTitle>
										<div className="flex items-center space-x-2">
											<span className="text-2xl md:text-3xl font-bold text-gray-900">
												{getCardValue(item.id)}
											</span>
										</div>
									</div>
									<div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
										<Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
									</div>
								</CardHeader>
								<CardContent className="relative">
									<p className="text-sm text-gray-500">
										{item.description}
									</p>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Full Width Chart Section */}
			<Card className="border-0 shadow-lg bg-white">
				<CardHeader className="space-y-3 px-4 md:px-6">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
								Cash Flow Analysis
							</CardTitle>
							<CardDescription className="text-gray-500 mt-1">
								Hourly cash collection throughout the day
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="px-4 md:px-6">
					<ResponsiveContainer width="100%" height={400}>
						<AreaChart data={dashboardData?.cashMemoData}>
							<defs>
								<linearGradient
									id="colorGradient"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor="#6366f1"
										stopOpacity={0.8}
									/>
									<stop
										offset="25%"
										stopColor="#8b5cf6"
										stopOpacity={0.6}
									/>
									<stop
										offset="50%"
										stopColor="#06b6d4"
										stopOpacity={0.4}
									/>
									<stop
										offset="75%"
										stopColor="#10b981"
										stopOpacity={0.3}
									/>
									<stop
										offset="95%"
										stopColor="#f59e0b"
										stopOpacity={0.1}
									/>
								</linearGradient>
								<linearGradient
									id="strokeGradient"
									x1="0"
									y1="0"
									x2="1"
									y2="0"
								>
									<stop offset="0%" stopColor="#6366f1" />
									<stop offset="25%" stopColor="#8b5cf6" />
									<stop offset="50%" stopColor="#06b6d4" />
									<stop offset="75%" stopColor="#10b981" />
									<stop offset="100%" stopColor="#f59e0b" />
								</linearGradient>
							</defs>
							<XAxis
								dataKey="hour"
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								dy={10}
							/>
							<YAxis
								stroke="#6b7280"
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) => `${value}`}
								dx={-10}
							/>
							<Tooltip
								content={({ active, payload, label }) => {
									if (active && payload && payload.length) {
										return (
											<div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
												<p className="font-semibold text-gray-900 mb-2">
													{label}
												</p>
												<div className="flex items-center justify-between space-x-4">
													<div className="flex items-center space-x-2">
														<div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
														<span className="text-sm text-gray-600">
															Cash Memo Price
														</span>
													</div>
													<span className="font-bold text-lg text-gray-900">
														Rs. {payload[0]?.value}
													</span>
												</div>
											</div>
										);
									}
									return null;
								}}
							/>
							<Area
								type="monotone"
								dataKey="cash"
								stroke="url(#strokeGradient)"
								strokeWidth={3}
								fill="url(#colorGradient)"
								dot={{
									fill: "#ffffff",
									stroke: "url(#strokeGradient)",
									strokeWidth: 3,
									r: 5,
									filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
								}}
								activeDot={{
									r: 8,
									stroke: "#6366f1",
									strokeWidth: 3,
									fill: "#ffffff",
									filter: "drop-shadow(0 4px 8px rgba(99,102,241,0.3))",
								}}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* MAP */}
			<Card className="border-0 shadow-lg bg-white">
				<CardHeader className="space-y-3 px-4 md:px-6">
					<CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
						Supervisor Map
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 md:px-6">
					<SupervisorMap mapData={dashboardData?.mapData ?? []} />
				</CardContent>
			</Card>
		</div>
	);
};

export default Dashboard;
