import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { getFile } from "@/storage/opfs";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { MusicCollection, MusicItem } from "@/data/schema";
import { useMusicCollection } from "@/data/useMusicCollection";
import { usePlayState } from "./PlayState";
import { useMediaPlayer } from "./useMediaPlayer";
import { useActiveTrack } from "./ActiveTrackState";

export function useTrackList(trackId: DocumentId | AutomergeUrl | undefined) {
	const [doc] = useDocument<MusicCollection>(trackId);

	const { activeTrack, loading, setActiveTrack, setLoading } = useActiveTrack();

	const tracks = doc?.items ?? [];

	function getNextSong() {
		const currentIndex = tracks.findIndex((item) => item === activeTrack);
		const nextIndex = (currentIndex + 1) % tracks.length;

		return tracks[nextIndex];
	}

	function getPrevSong() {
		const currentIndex = tracks.findIndex((item) => item === activeTrack);
		const previousIndex = (currentIndex - 1 + tracks.length) % tracks.length;
		return tracks[previousIndex];
	}

	const playState = usePlayState();
	const playMedia = useMediaPlayer();

	async function loadMediaItem(item: MusicItem) {
		if (item === activeTrack) {
			return playState.toggle();
		}

		setLoading(true);
		setActiveTrack(item);

		const file = await getFile(item.file.id);
		await playMedia(file);
		setLoading(false);
	}

	return {
		tracks,
		activeTrack,
		setActiveTrack: loadMediaItem,
		loading,
		getNextSong,
		getPrevSong,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
