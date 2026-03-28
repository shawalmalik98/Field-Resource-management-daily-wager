"use client";

import FullLoading from "@/components/fullLoading";
import { userDetailsApi } from "@/lib/apis";
import { UserType } from "@/lib/types";
import useUserStore from "@/state/userState";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
	const router = useRouter();
	const [isLoading] = useState(true);
	const [token, setToken] = useState<string | null>(null);
	const { save } = useUserStore();

	useEffect(() => {
		if (typeof window !== "undefined") {
			const localToken = localStorage.getItem("wager_token");
			setToken(localToken);
		}
	}, []);

	const { data: userDetails, isLoading: isUserDetailsLoading } = useQuery({
		queryKey: ["userDetails"],
		queryFn: userDetailsApi,
		enabled: token != null,
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("wager_token");
			if (!token) {
				router.replace("/login");
			} else {
				if (userDetails == false) {
					localStorage.removeItem("wager_token");
					router.replace("/login");
				} else {
					save(userDetails as UserType);
					router.replace("/dashboard");
				}
			}
		}
	}, [router, token, userDetails]);

	return isLoading || isUserDetailsLoading ? <FullLoading /> : null;
}
