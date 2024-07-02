import { Separator } from "@radix-ui/react-separator";
import { Table, TableBody } from "../ui/table";
import { TrackRow } from "./track-row";
import { DocumentId } from "@automerge/automerge-repo";
import { useTrackList } from "@/data/useTrackList";
import { useTrackListMediaSync } from "@/data/useTrackListMediaSync";
import { useMemo } from "react";
import { usePlaylist } from "@/data/usePlaylist";
import { useUser } from "@/auth/useUser";
import { useMusicCollection } from "@/data/useMusicCollection";
import { MusicItem } from "@/data/models/MusicItem";

type TrackListProps = {
	filter: string;
	trackId: DocumentId | undefined;
};
export function TrackList({ filter, trackId }: TrackListProps) {
	const { tracks, activeTrack, setActiveTrack } = useTrackList(trackId);
	useTrackListMediaSync(trackId);

	const filteredTracks = tracks.filter((i) =>
		i.title.toLowerCase().includes(filter.toLowerCase()),
	);

	const user = useUser();

	const isRootMusicCollection = trackId === user.rootDocument;

	const musicCollection = usePlaylist(user.rootDocument);
	const playlist = usePlaylist(trackId);

	const musicCollectionApi = useMusicCollection();

	const { tracks: musicCollectionTracks } = useTrackList(user.rootDocument);

	function addSongToPlaylist(item: MusicItem) {
		const documentId = musicCollection.findDocumentId(item);

		if (documentId) playlist.addTrack(documentId);
	}

	const tracksToAdd = useMemo(() => {
		const ids = new Set(tracks.map((t) => t.id));

		return musicCollectionTracks
			.filter((t) => !ids.has(t.id))
			.filter((t) => t.title.toLowerCase().includes(filter.toLowerCase()));
	}, [tracks, musicCollectionTracks, filter]);

	const showAddTracks = !isRootMusicCollection && tracksToAdd.length > 0;

	return (
		<>
			<h2 className="text-2xl font-semibold tracking-tight mt-5">Tracks</h2>
			<Separator className="my-4" />
			<div>
				<Table>
					<TableBody>
						{filteredTracks.map((item, i) => {
							const isCurrentActiveMedia = item === activeTrack;
							return (
								<TrackRow
									isCurrentActiveMedia={isCurrentActiveMedia}
									item={item}
									onMediaDelete={
										isRootMusicCollection
											? musicCollectionApi.deleteItem
											: playlist.removeTrack
									}
									onMediaSelect={setActiveTrack}
									onMediaUpdate={
										isRootMusicCollection
											? musicCollectionApi.updateItem
											: undefined
									}
									key={item.id}
									i={i}
								/>
							);
						})}
					</TableBody>
				</Table>
				{showAddTracks && (
					<>
						Add to the playlist:
						<Table>
							<TableBody>
								{tracksToAdd.map((item, i) => {
									return (
										<TrackRow
											isCurrentActiveMedia={false}
											item={item}
											onMediaSelect={addSongToPlaylist}
											key={item.id}
											i={i}
											showAddButton
										/>
									);
								})}
							</TableBody>
						</Table>
					</>
				)}
			</div>
		</>
	);
}
