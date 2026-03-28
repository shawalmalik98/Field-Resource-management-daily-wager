"use client";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import useUserStore from "@/state/userState";
import Image from "next/image";

export function AppSidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { pages } = useUserStore();

	const handleLogout = () => {
		localStorage.removeItem("wager_token");
		router.replace("/login");
	};

	return (
		<Sidebar className="flex flex-col h-screen border-none shadow-md bg-white">
			<SidebarHeader className="flex items-center justify-center py-6">
				{/* <span className="text-lg font-bold text-gray-800">
					Aysis international
				</span> */}
				<div className="w-full h-[50px] relative">
					<Image
						src="/logo.png"
						alt="Aysis International"
						fill
						className=" object-contain"
					/>
				</div>
			</SidebarHeader>
			<Separator />
			<SidebarContent className="flex-1 flex flex-col">
				<SidebarMenu className="mt-4 space-y-1 px-3">
					{pages.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								className={cn(
									"rounded-md hover:bg-muted hover:text-gray-800 active:bg-card-foreground",
									pathname === item.url
										? "bg-primary text-white hover:bg-primary hover:text-white"
										: "text-gray-800  "
								)}
							>
								<Link
									href={item.url}
									className={`flex items-center  gap-3 px-4 py-6 transition-colors font-medium text-base `}
								>
									<item.icon className="h-5 w-5" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
				<SidebarContent />

				<SidebarFooter>
					<Separator />
					<Button
						variant={"ghost"}
						className="flex items-center gap-3 text-gray-700 hover:bg-card-foreground hover:text-white font-medium w-full"
						onClick={handleLogout}
					>
						<LogOut className="h-5 w-5" />
						<span>Sign out</span>
					</Button>
				</SidebarFooter>
			</SidebarContent>
		</Sidebar>
	);
}
