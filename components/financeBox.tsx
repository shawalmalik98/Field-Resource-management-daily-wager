"use client";
import React, { useState } from "react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "./ui/table";
import { getCashMemoFinanceApi } from "@/lib/apis";
import ApiLoading from "./apiLoading";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Props = {
	supervisorId: number;
	open: boolean;
	totalAmount: number;
	setOpen: (open: boolean) => void;
	onDone: (amount: number) => void;
};

const FinanceBox = ({
	supervisorId,
	open,
	setOpen,
	onDone,
	totalAmount,
}: Props) => {
	const [payAmount, setPayAmount] = useState(0);

	const { data: financeData, isLoading } = useQuery({
		queryKey: ["financeData", supervisorId],
		queryFn: () => getCashMemoFinanceApi(supervisorId),
	});

	const totalDebit = financeData?.reduce((sum, cm) => sum + cm.debit, 0);
	const totalCredit = financeData?.reduce((sum, cm) => sum + cm.credit, 0);
	const totalRemaining = totalDebit ? totalDebit - (totalCredit || 0) : 0;

	if (isLoading) return <ApiLoading />;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[70vw]">
				<DialogHeader>
					<DialogTitle>
						Pay Cash Memo, (Cash Memo Amount: {totalAmount} +
						Remaining Amount: {totalRemaining})
					</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-2">
					<div className="h-[300px]">
						<Table className="max-h-[300px] overflow-y-auto">
							<TableHeader>
								<TableRow>
									<TableHead>Cash Memo Id</TableHead>
									<TableHead>Debit</TableHead>
									<TableHead>Credit</TableHead>
									<TableHead>Remaining</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{financeData?.map((item) => (
									<TableRow
										key={item.id}
										className="border-b border-gray-200 hover:bg-gray-50"
									>
										<TableCell>{item.id}</TableCell>
										<TableCell>{item.debit}</TableCell>
										<TableCell>{item.credit}</TableCell>
										<TableCell>{item.remaining}</TableCell>
									</TableRow>
								))}
							</TableBody>
							<TableFooter className="border-t border-gray-200">
								<TableRow>
									<TableCell
										colSpan={4}
										className="py-4 font-semibold text-right"
									>
										Remaining Amount: {totalRemaining}
									</TableCell>
								</TableRow>
							</TableFooter>
						</Table>
					</div>

					<div className="flex flex-col gap-2">
						<Label>
							Pay Amount (Cash Memo Amount: {totalAmount} +
							Remaining Amount: {totalRemaining})
						</Label>
						<Input
							type="number"
							className="w-full border border-primary"
							value={payAmount}
							onChange={(e) => {
								const value = Number(e.target.value);
								if (value > totalAmount + totalRemaining) {
									setPayAmount(totalAmount + totalRemaining);
								} else {
									setPayAmount(value);
								}
							}}
						/>
					</div>
				</div>
				<DialogFooter className="flex w-full justify-between">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
					<Button
						type="button"
						onClick={() => onDone(payAmount)}
						disabled={payAmount === 0}
						className={"bg-emerald-500 hover:bg-emerald-700"}
					>
						Continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default FinanceBox;
