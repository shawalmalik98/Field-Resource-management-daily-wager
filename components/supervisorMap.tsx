"use client";
import { DashboardResponse } from "@/lib/apiTypes";
import {
	GoogleMap,
	InfoWindow,
	Marker,
	useJsApiLoader,
} from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
	width: "100%",
	height: "400px",
};

const center = {
	lat: 24.8607,
	lng: 67.0011,
};

const SupervisorMap = ({
	mapData,
}: {
	mapData: DashboardResponse["mapData"];
}) => {
	const [activeMarker, setActiveMarker] = useState<number | null>(null);
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: "AIzaSyCSZose-qsi5IJ8w9LE-TeukXtb0fevzFA",
	});

	if (!isLoaded) return <div>Loading Map...</div>;

	return (
		<GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
			{mapData.map((marker, idx) => (
				<Marker
					key={idx}
					position={{
						lat: Number(marker.latitude),
						lng: Number(marker.longitude),
					}}
					onMouseOver={() => setActiveMarker(idx)}
					onMouseOut={() => setActiveMarker(null)}
				>
					{activeMarker === idx && (
						<InfoWindow
							position={{
								lat: Number(marker.latitude),
								lng: Number(marker.longitude),
							}}
						>
							<span className="text-lg font-medium">
								{marker.title}
							</span>
						</InfoWindow>
					)}
				</Marker>
			))}
		</GoogleMap>
	);
};

export default SupervisorMap;
