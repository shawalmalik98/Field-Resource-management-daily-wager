/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserType } from "@/lib/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
	user: UserType | null;
	save: (u: UserType | null) => void;
	pages: {
		title: string;
		url: string;
		icon: any;
	}[];
	savePages: (
		p: {
			title: string;
			url: string;
			icon: any;
		}[]
	) => void;
}

const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			save: (u) => set(() => ({ user: u })),
			pages: [],
			savePages: (p) => set(() => ({ pages: p })),
		}),
		{
			name: "wagerUser",
		}
	)
);

export default useUserStore;
