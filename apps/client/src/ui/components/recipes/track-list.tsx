import { Separator } from "@radix-ui/react-separator";
import { Table, TableBody } from "../ui/table";
import { TrackRow } from "./track-row";
import { AutomergeUrl, DocumentId } from "@automerge/automerge-repo";
import { useTrackList } from "@/audio/useTrackList";
import { useMusicCollection } from "@/data/useMusicCollection";
import { useTrackListMediaSync } from "@/data/useTrackListMediaSync";

type TrackListProps = {
	filter: string;
	trackId: DocumentId | AutomergeUrl | undefined;
};
export function TrackList({ filter, trackId }: TrackListProps) {
	const { tracks, activeTrack, setActiveTrack } = useTrackList(trackId);
	useTrackListMediaSync(trackId);

	const filteredTracks = tracks.filter((i) =>
		i.title.toLowerCase().includes(filter.toLowerCase()),
	);

	const musicCollection = useMusicCollection();

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
			</div>
		</>
	);
}
