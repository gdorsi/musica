import {
	useDocument,
	useDocuments,
} from "@automerge/automerge-repo-react-hooks";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { useMusicCollection } from "@/data/useMusicCollection";

import { useMemo } from "react";
import { useActiveTrack } from "@/audio/ActiveTrackState";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { Playlist } from "@musica/shared/models/Playlist";
import { RootDocument } from "@musica/shared/models/RootDocument";
import { usePlayState } from "@/audio/usePlayState";

export function useTrackList(trackId: DocumentId | AutomergeUrl | undefined) {
	const [doc] = useDocument<Playlist | RootDocument>(trackId);

	const { activeTrack, loading, setActiveTrack, setActivePlaylist } =
		useActiveTrack();

	const tracksMap = useDocuments<MusicItem>(doc?.tracks);

	const playState = usePlayState();
	const tracks = useMemo(() => Object.values(tracksMap), [tracksMap]);

	async function selectMediaItem(item: MusicItem) {
		if (item === activeTrack) {
			playState.toggle();
			return;
		}

		setActiveTrack(item);

		if (doc) {
			setActivePlaylist(doc);
		}
	}

	return {
		tracks,
		activeTrack,
		selectMediaItem,
		loading,
	};
}

export type MusicCollectionApi = ReturnType<typeof useMusicCollection>;
