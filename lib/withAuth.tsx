/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { userDetailsApi } from "@/lib/apis";
import useUserStore from "@/state/userState";
import { UserType } from "@/lib/types";
import {
	LayoutDashboard,
	User,
	Users,
	MapPin,
	Map,
	Banknote,
	MapPinCheck,
	HardHat,
	Building2,
	Clock,
	Shield,
	Lock,
	FileText,
} from "lucide-react";
import FullLoading from "@/components/fullLoading";

const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Supervisors",
		url: "/supervisors",
		icon: User,
	},
	{
		title: "Contractors",
		url: "/contractor",
		icon: HardHat,
	},
	{
		title: "Department & Designations",
		url: "/depdes",
		icon: Building2,
	},
	{
		title: "Employees",
		url: "/employees",
		icon: Users,
	},
	{
		title: "Attendance",
		url: "/attendance",
		icon: Clock,
	},
	{
		title: "Locations",
		url: "/locations",
		icon: MapPin,
	},
	{
		title: "UC & Ward",
		url: "/uc-ward",
		icon: MapPinCheck,
	},
	{
		title: "Zones",
		url: "/zones",
		icon: Map,
	},
	{
		title: "Cash Memo",
		url: "/cash-memo",
		icon: Banknote,
	},
	{
		title: "Reports",
		url: "/reports",
		icon: FileText,
	},
	{
		title: "Permissions",
		url: "/permissions",
		icon: Shield,
	},
	{
		title: "Reset Password",
		url: "/resetPass",
		icon: Lock,
	},
];

const filterPages = (pages: UserType["pages"], role: UserType["role"]) => {
	const result: typeof items = [];

	if (pages?.dashboard ?? true) result.push(items[0]);
	if (pages?.supervisor ?? true) result.push(items[1]);
	if (pages?.contractor ?? true) result.push(items[2]);
	if (pages?.depdes ?? true) result.push(items[3]);
	if (pages?.employee ?? true) result.push(items[4]);
	if (pages?.attendance ?? true) result.push(items[5]);
	if (pages?.location ?? true) result.push(items[6]);
	if (pages?.ucWard ?? true) result.push(items[7]);
	if (pages?.zone ?? true) result.push(items[8]);
	if (pages?.cashMemo ?? true) result.push(items[9]);
	if (pages?.reports ?? true) result.push(items[10]);
	if (role === "ADMIN" || role === "SUPER_ADMIN") result.push(items[11]);

	result.push(items[12]);

	return result;
};

export function withAuth(
	WrappedComponent: React.ComponentType<any>
): React.FC<any> {
	return function AuthWrapper(props: any) {
		const router = useRouter();
		const pathname = usePathname();
		const { save, savePages } = useUserStore();

		const [allowed, setAllowed] = useState(false);

		const { data: userDetails, isLoading } = useQuery({
			queryKey: ["userDetails"],
			queryFn: userDetailsApi,
		});

		useEffect(() => {
			const token =
				typeof window !== "undefined"
					? localStorage.getItem("wager_token")
					: null;

			if (!token) {
				router.replace("/login");
				return;
			}

			if (!isLoading) {
				if (!userDetails) {
					localStorage.removeItem("wager_token");
					router.replace("/login");
					return;
				}

				const uDetails = userDetails as UserType;
				save(uDetails);

				const filteredPages = filterPages(
					uDetails.pages,
					uDetails.role
				);
				savePages(filteredPages);
				const allowedUrls = filteredPages.map((p) => p.url);

				if (!allowedUrls.includes(pathname)) {
					router.replace(filteredPages[0]?.url ?? "/dashboard");
				} else {
					setAllowed(true);
				}
			}
		}, [userDetails, isLoading, pathname]);

		if (isLoading || !allowed) return <FullLoading />;

		return <WrappedComponent {...props} />;
	};
}
