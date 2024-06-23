import { Separator } from "@radix-ui/react-separator";
import { Table, TableBody } from "../ui/table";
import { TrackRow } from "./track-row";
import { DocumentId } from "@automerge/automerge-repo";
import { useTrackList } from "@/audio/useTrackList";
import { useMusicCollection } from "@/data/useMusicCollection";
import { useTrackListMediaSync } from "@/data/useTrackListMediaSync";
import { useMemo } from "react";

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

	const musicCollection = useMusicCollection();

	const tracksToAdd = useMemo(() => {
		const ids = new Set(tracks.map((t) => t.id));

		return musicCollection.tracks
			.filter((t) => !ids.has(t.id))
			.filter((t) => t.title.toLowerCase().includes(filter.toLowerCase()));
	}, [tracks, musicCollection.tracks, filter]);

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
									onMediaDelete={musicCollection.deleteItem}
									onMediaSelect={setActiveTrack}
									onMediaUpdate={musicCollection.updateItem}
									key={item.id}
									i={i}
								/>
							);
						})}
					</TableBody>
				</Table>
				{tracksToAdd.length > 0 && (
					<>
						Add to the playlist:
						<Table>
							<TableBody>
								{tracksToAdd.map((item, i) => {
									return (
										<TrackRow
											isCurrentActiveMedia={false}
											item={item}
											onMediaDelete={musicCollection.deleteItem}
											onMediaSelect={setActiveTrack}
											onMediaUpdate={musicCollection.updateItem}
											key={item.id}
											i={i}
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
