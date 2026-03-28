"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DepartmentTable from "@/components/depDes/departmentTable";
import DesignationTable from "@/components/depDes/designationTable";

const DepartmentDesignations = () => {
	return (
		<div>
			<h1 className="text-2xl font-semibold mb-4">
				Department & Designations
			</h1>

			<Tabs defaultValue="departments" className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-full">
					<TabsTrigger
						className="py-3 cursor-pointer"
						value="departments"
					>
						Departments
					</TabsTrigger>
					<TabsTrigger
						className="py-3 cursor-pointer"
						value="designations"
					>
						Designations
					</TabsTrigger>
				</TabsList>

				<TabsContent value="departments">
					<DepartmentTable />
				</TabsContent>

				<TabsContent value="designations">
					<DesignationTable />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DepartmentDesignations;
