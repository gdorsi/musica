import type { MusicCollection, MusicItem } from "@/data/schema";
import { Separator } from "@radix-ui/react-separator";
import { Table, TableBody } from "../ui/table";
import { TrackRow } from "./track-row";

type TrackListProps = {
	onMediaSelect: (item: MusicItem) => void;
	onMediaDelete: (item: MusicItem) => void;
	onMediaUpdate: (item: MusicItem, patch: Partial<MusicItem>) => void;
	tracks: MusicCollection["items"];
	activeMedia: MusicItem | null;
	isPlaying: boolean;
};
export function TrackList({
	onMediaSelect,
	onMediaDelete,
	onMediaUpdate,
	tracks,
	activeMedia,
	isPlaying,
}: TrackListProps) {
	return (
		<>
			<h2 className="text-2xl font-semibold tracking-tight mt-5">Tracks</h2>
			<Separator className="my-4" />
			<div>
				<Table>
					<TableBody>
						{tracks.map((item, i) => {
							const isCurrentActiveMedia = item === activeMedia;
							return (
								<TrackRow
									isCurrentActiveMedia={isCurrentActiveMedia}
									item={item}
									onMediaDelete={onMediaDelete}
									onMediaSelect={onMediaSelect}
									onMediaUpdate={onMediaUpdate}
									key={item.id}
									i={i}
									isPlaying={isPlaying}
								/>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</>
	);
}
