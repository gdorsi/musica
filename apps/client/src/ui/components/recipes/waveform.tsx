import { usePlayerCurrentTime } from "@/audio/usePlayerCurrentTime";
import { MusicItem } from "@musica/shared/models/MusicItem";
import { cn } from "@/ui/utils";

export function WaveForm(props: {
	activeMedia: MusicItem;
	height: number;
}) {
	const { activeMedia, height } = props;
	const waveFormData = activeMedia.waveform;
	const duration = activeMedia.duration;

	const currentTime = usePlayerCurrentTime();

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
	const activeBar = Math.ceil(barCount * (currentTime.value / duration));

	function seek(i: number) {
		currentTime.setValue((i / barCount) * duration);
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
						activeBar >= i ? "bg-gray-500" : "bg-gray-300",
						"hover:bg-black hover:border-1 hover:border-solid hover:border-black",
						"focus-visible:outline-black focus:outline-none",
					)}
					style={{
						height: height * value,
					}}
				/>
			))}
		</div>
	);
}
