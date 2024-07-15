import { MdDelete } from "react-icons/md";
import { FaPause, FaPlayCircle, FaPlus } from "react-icons/fa";
import { cn } from "@/utils";
import { TableRow, TableCell } from "../ui/table";
import { usePlayState } from "@/audio/usePlayState";
import { MusicItem } from "@musica/shared/models/MusicItem";

type TrackProps = {
	onMediaSelect: (item: MusicItem) => void;
	onMediaDelete?: (item: MusicItem) => void;
	onMediaUpdate?:
		| ((item: MusicItem, patch: Partial<MusicItem>) => void)
		| undefined;
	item: MusicItem;
	isCurrentActiveMedia: boolean;
	i: number;
	showAddButton?: boolean;
};
export function TrackRow({
	isCurrentActiveMedia,
	item,
	onMediaDelete,
	onMediaSelect,
	onMediaUpdate,

	showAddButton,
}: TrackProps) {
	function handleDelete(
		event: React.MouseEvent<HTMLButtonElement>,
		item: MusicItem,
	) {
		event.stopPropagation();

		onMediaDelete?.(item);
	}

	function handleChange(evt: React.ChangeEvent<HTMLInputElement>) {
		onMediaUpdate?.(item, {
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
						<img
							src="https://placehold.co/512x512"
							alt={`${item.title} cover`}
							className="w-full h-auto"
						/>
					</span>
					<span
						className={cn(
							!isCurrentActiveMedia &&
								"hidden group-hover:block group-focus/button:block",
						)}
					>
						{showAddButton ? (
							<FaPlus size={30} />
						) : isPlaying ? (
							<FaPause size={30} />
						) : (
							<FaPlayCircle size={30} />
						)}
					</span>
				</button>
			</TableCell>

			<TableCell className="font-medium">
				{onMediaUpdate ? (
					<input
						className="bg-transparent w-full"
						value={item.title}
						onChange={handleChange}
					/>
				) : (
					item.title
				)}
			</TableCell>
			<TableCell className="w-[30px]">
				<div>
					{Math.ceil(item.duration / 60)}:{Math.ceil(item.duration % 60)}
				</div>
			</TableCell>
			<TableCell className="w-[50px]">
				{onMediaDelete && (
					<button
						type="button"
						onClick={(e) => handleDelete(e, item)}
						className="w-[30px] hidden group-hover:grid h-full items-center border-none"
					>
						<MdDelete size={30} />
					</button>
				)}
			</TableCell>
		</TableRow>
	);
}
