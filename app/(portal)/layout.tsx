"use client";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { withAuth } from "@/lib/withAuth";

function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-full h-full">
				<Header />
				<div className="p-4">{children}</div>
			</main>
		</SidebarProvider>
	);
}

export default withAuth(Layout);
