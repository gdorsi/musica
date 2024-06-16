import { MusicItem } from "@/data/schema";
import { cn } from "@/ui/utils";

export function WaveForm(props: {
	activeMedia: MusicItem;
	currentTime: number;
	isPlaying: boolean;
	height: number;
	onSeek(time: number): void;
}) {
	const { activeMedia, currentTime, height } = props;
	const waveFormData = activeMedia.waveform;
	const duration = activeMedia.duration;

	if (waveFormData === null) {
		return (
			<div
				style={{
					height,
				}}
			/>
		);
	}

	const barCount = waveFormData.length;
	const activeBar = Math.ceil(barCount * (currentTime / duration));

	function seek(i: number) {
		props.onSeek((i / barCount) * duration);
	}

	return (
		<div
			className="flex justify-center items-end"
			style={{
				height,
				gap: 1,
			}}
		>
			{waveFormData.map((value, i) => (
				<button
					type="button"
					// biome-ignore lint/suspicious/noArrayIndexKey: it's ok here
					key={i}
					onClick={() => seek(i)}
					className={cn(
						"w-1 transition-colors rounded-none",
						activeBar >= i ? "bg-gray-600" : "bg-gray-400",
						activeBar === i && props.isPlaying && "animate-pulse",
					)}
					style={{
						height: height * value,
					}}
				/>
			))}
		</div>
	);
}
