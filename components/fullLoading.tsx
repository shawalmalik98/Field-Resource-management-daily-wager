import React from "react";
import Loading from "./loading";

function FullLoading() {
	return (
		<div className="bg-background flex h-screen max-h-screen w-full items-center justify-center">
			<Loading className="h-8 w-8" />
		</div>
	);
}

export default FullLoading;
