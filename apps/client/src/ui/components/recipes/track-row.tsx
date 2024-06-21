import { MdDelete } from "react-icons/md";
import { FaPause, FaPlayCircle } from "react-icons/fa";
import type { MusicItem } from "@/data/schema";
import { cn } from "@/ui/utils";
import { TableRow, TableCell } from "../ui/table";
import { usePlayState } from "@/audio/PlayState";

type TrackProps = {
	onMediaSelect: (item: MusicItem) => void;
	onMediaDelete: (item: MusicItem) => void;
	onMediaUpdate: (item: MusicItem, patch: Partial<MusicItem>) => void;
	item: MusicItem;
	isCurrentActiveMedia: boolean;
	i: number;
};
export function TrackRow({
	isCurrentActiveMedia,
	item,
	onMediaDelete,
	onMediaSelect,
	onMediaUpdate,
	i,
}: TrackProps) {
	function handleDelete(
		event: React.MouseEvent<HTMLButtonElement>,
		item: MusicItem,
	) {
		event.stopPropagation();

		onMediaDelete(item);
	}

	function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
		onMediaUpdate(item, {
			title: evt.currentTarget.value,
		});
	}

	const playState = usePlayState();
	const isPlaying = isCurrentActiveMedia && playState.value === "play";

	return (
		<TableRow
			className={cn(
				"group hover:bg-gray-100",
				!isCurrentActiveMedia ? " text-gray-600" : "bg-gray-200 text-black",
			)}
		>
			<TableCell className="w-1" onClick={() => onMediaSelect(item)}>
				<button
					type="button"
					className="group/button h-full grid items-center text-center w-[30px] border-none"
				>
					<span
						className={cn(
							!isCurrentActiveMedia
								? "group-focus/button:hidden group-hover:hidden"
								: "hidden",
							"font-bold",
						)}
					>
						{i}
					</span>
					<span
						className={cn(
							!isCurrentActiveMedia &&
								"hidden group-hover:block group-focus/button:block",
						)}
					>
						{isPlaying ? <FaPause size={30} /> : <FaPlayCircle size={30} />}
					</span>
				</button>
			</TableCell>
			<TableCell className="w-12">
				<img
					src="https://placehold.co/512x512"
					alt={`${item.title} cover`}
					className="w-full h-auto"
				/>
			</TableCell>
			<TableCell className="font-medium">
				<input
					className="bg-transparent w-full"
					value={item.title}
					onChange={handleChange}
				/>
			</TableCell>
			<TableCell className="w-[30px]">
				<div>
					{Math.ceil(item.duration / 60)}:{Math.ceil(item.duration % 60)}
				</div>
			</TableCell>
			<TableCell className="w-[50px]">
				<button
					type="button"
					onClick={(e) => handleDelete(e, item)}
					className="w-[30px] hidden group-hover:grid h-full items-center border-none"
				>
					<MdDelete size={30} />
				</button>
			</TableCell>
		</TableRow>
	);
}
