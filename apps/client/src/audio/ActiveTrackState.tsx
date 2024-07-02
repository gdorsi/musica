import { useContext, useMemo, useState } from "react";
import { MusicItem } from "@/data/models/MusicItem";
import { createContext } from "react";

type ActiveTrackState = {
	activeTrack: MusicItem | null;
	loading: boolean;
	setActiveTrack: (item: MusicItem) => void;
	setLoading: (value: boolean) => void;
};
const activeTrackContext = createContext<ActiveTrackState>({
	activeTrack: null,
	loading: false,
	setActiveTrack: () => {},
	setLoading: () => {},
});

export function useActiveTrack() {
	return useContext(activeTrackContext);
}

export function ActiveTrackProvider(props: { children: React.ReactNode }) {
	const [activeTrack, setActiveTrack] = useState<MusicItem | null>(null);
	const [loading, setLoading] = useState(false);

	const ctx = useMemo(
		() => ({
			activeTrack,
			setActiveTrack,
			loading,
			setLoading,
		}),
		[activeTrack, loading],
	);

	return (
		<activeTrackContext.Provider value={ctx}>
			{props.children}
		</activeTrackContext.Provider>
	);
}
