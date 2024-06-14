import { MediaPlayer } from "@/audio/useMediaPlayer";
import { cn } from "@/ui/utils";

export function WaveForm(props: {
	mediaPlayer: MediaPlayer;
	height: number;
}) {
	const { mediaPlayer, height } = props;
	const { waveFormData, duration, currentTime } = mediaPlayer;

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
	const isPlaying = mediaPlayer.playState === "play";

	function seek(i: number) {
		mediaPlayer.seek((i / barCount) * duration);
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
						activeBar === i && isPlaying && "animate-pulse",
					)}
					style={{
						height: height * value,
					}}
				/>
			))}
		</div>
	);
}
