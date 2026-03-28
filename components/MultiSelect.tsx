/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { MultiSelectOption } from "@/lib/types";

type Props = {
	options: MultiSelectOption[];
	value: any[];
	onChange: (value: any[]) => void;
	placeholder: string;
	returnIds?: boolean;
	disabled?: boolean;
};

function MultiSelect({
	options,
	value,
	onChange,
	placeholder,
	returnIds,
	disabled,
}: Props) {
	const [open, setOpen] = useState(false);

	const handleSelect = (option: { id: string; name: string }) => {
		if (returnIds) {
			const newValue =
				value.findIndex((v) => v == option.id) != -1
					? value.filter((item) => item != option.id)
					: [...value, option.id];
			onChange(newValue);
		} else {
			const newValue = value.includes(option.name)
				? value.filter((item) => item !== option.name)
				: [...value, option.name];
			onChange(newValue);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between"
					disabled={disabled}
				>
					{value.length > 0
						? `${value.length} selected`
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput
						placeholder={`Search ${placeholder.toLowerCase()}...`}
					/>
					<CommandList>
						<CommandEmpty>No options found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.id}
									value={option.name}
									onSelect={() => handleSelect(option)}
									className="group"
								>
									<Check
										className={cn(
											"mr-2 h-4 w-4",
											value.findIndex(
												(v) =>
													v ==
													(returnIds
														? option.id
														: option.name)
											) !== -1
												? "opacity-100 group-hover:text-white"
												: "opacity-0"
										)}
									/>
									{option.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export default MultiSelect;
