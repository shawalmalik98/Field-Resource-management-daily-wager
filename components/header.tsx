"use client";

import useUserStore from "@/state/userState";
import { SidebarTrigger } from "./ui/sidebar";

function Header() {
	const { user } = useUserStore();

	return (
		<div className="bg-white shadow-sm ">
			<div className="flex items-center justify-between h-16 px-6">
				<SidebarTrigger />

				<div className="text-sm text-gray-600">
					Welcome back, {user?.name}
				</div>
			</div>
		</div>
	);
}

export default Header;
