import { useContext, useMemo, useState } from "react";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { createContext } from "react";
import { Playlist } from "@musica/shared/models/Playlist";
import { RootDocument } from "@musica/shared/models/RootDocument";

type ActiveTrackState = {
	activePlaylist: Playlist | RootDocument | null;
	activeTrack: MusicItem | null;
	loading: boolean;
	setActivePlaylist: (playlist: Playlist | RootDocument) => void;
	setActiveTrack: (item: MusicItem) => void;
	setLoading: (value: boolean) => void;
};
const activeTrackContext = createContext<ActiveTrackState>({
	activePlaylist: null,
	activeTrack: null,
	loading: false,
	setActivePlaylist: () => {},
	setActiveTrack: () => {},
	setLoading: () => {},
});

export function useActiveTrack() {
	return useContext(activeTrackContext);
}

export function ActiveTrackProvider(props: { children: React.ReactNode }) {
	const [activePlaylist, setActivePlaylist] = useState<
		Playlist | RootDocument | null
	>(null);
	const [activeTrack, setActiveTrack] = useState<MusicItem | null>(null);
	const [loading, setLoading] = useState(false);

	const ctx = useMemo(
		() => ({
			activeTrack,
			setActiveTrack,
			activePlaylist,
			setActivePlaylist,
			loading,
			setLoading,
		}),
		[activeTrack, activePlaylist, loading],
	);

	return (
		<activeTrackContext.Provider value={ctx}>
			{props.children}
		</activeTrackContext.Provider>
	);
}
