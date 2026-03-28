"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UCTab from "@/components/uc-ward/UCTab";
import WardTab from "@/components/uc-ward/WardTab";

const UCWard = () => {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">
					UC & Ward Management
				</h2>
				<p className="text-muted-foreground">
					Manage Union Councils and Wards
				</p>
			</div>

			<Tabs defaultValue="uc" className="w-full ">
				<TabsList className="grid w-full grid-cols-2 h-full">
					<TabsTrigger value="uc" className="py-3 cursor-pointer">
						Union Councils
					</TabsTrigger>
					<TabsTrigger value="ward" className="py-3 cursor-pointer">
						Wards
					</TabsTrigger>
				</TabsList>

				<TabsContent value="uc" className="space-y-4">
					<UCTab />
				</TabsContent>

				<TabsContent value="ward" className="space-y-4">
					<WardTab />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default UCWard;
