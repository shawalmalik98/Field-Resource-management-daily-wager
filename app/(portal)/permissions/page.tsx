"use client";

import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UserType } from "@/lib/types";
import {
	getAllRolesPermissionsApi,
	updateRolesPermissionsApi,
} from "@/lib/apis";
import { useMutation, useQuery } from "@tanstack/react-query";
import ApiLoading from "@/components/apiLoading";
import ApiError from "@/components/apiError";
import { RolesPermissionsResponse } from "@/lib/apiTypes";
import { showSuccessToast } from "@/lib/toaster";

type Props = object;

function PermissionPage({}: Props) {
	const {
		data: rolesPermissions,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["roles-permissions"],
		queryFn: getAllRolesPermissionsApi,
	});

	const { mutate: updateRolesPermissions, isPending } = useMutation({
		mutationKey: ["update-roles-permissions"],
		mutationFn: updateRolesPermissionsApi,
		onSuccess: () => {
			showSuccessToast("Roles permissions updated successfully");
			refetch();
		},
	});

	const handleCheckboxChange = (
		val: boolean,
		role: UserType["role"],
		page: keyof RolesPermissionsResponse
	) => {
		if (!rolesPermissions) return;

		const pIdx = rolesPermissions.findIndex((rl) => rl.role === role);
		if (pIdx !== -1) {
			const updatedPermissions = [...rolesPermissions];
			updatedPermissions[pIdx] = {
				...updatedPermissions[pIdx],
				[page]: val,
			};

			updateRolesPermissions(updatedPermissions[pIdx]);
		}
	};

	if (isLoading || isPending) {
		return <ApiLoading />;
	}

	if (isError) {
		return <ApiError />;
	}

	return (
		<div>
			<div className="mb-4">
				<h1 className="text-2xl font-semibold">Permissions</h1>
			</div>

			<Card className="border-none">
				<CardHeader>
					<CardTitle>Permissions</CardTitle>
					<CardDescription>
						View and Set Role Permissions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow className="h-14">
								<TableHead className="text-gray-500 ">
									ROLES
								</TableHead>
								<TableHead className="text-gray-500 ">
									Dashboard Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Supervisor Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Contractor Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Department Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Employee Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Attendance Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Location Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									UC/Ward Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Zone Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Cash Memo Page
								</TableHead>
								<TableHead className="text-gray-500 ">
									Reports Page
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody className="border border-gray-200">
							{rolesPermissions?.map((role, i) => (
								<TableRow
									key={`${role}-${i}`}
									className="text-center h-16  "
								>
									<TableCell>{role.role}</TableCell>
									<TableCell>
										<Checkbox
											checked={role.dashboard ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"dashboard"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.supervisor ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"supervisor"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.contractor ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"contractor"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.depdes ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"employee"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.employee ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"depdes"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.attendance ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"attendance"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.location ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"location"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.ucWard ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"ucWard"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.zone ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"zone"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.cashMemo ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"cashMemo"
												)
											}
										/>
									</TableCell>
									<TableCell>
										<Checkbox
											checked={role.reports ?? false}
											onCheckedChange={(c: boolean) =>
												handleCheckboxChange(
													c,
													role.role,
													"reports"
												)
											}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

export default PermissionPage;
