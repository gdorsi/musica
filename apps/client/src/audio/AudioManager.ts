export class AudioManager {
	ctx: AudioContext;
	mediaElement: HTMLAudioElement;
	track: MediaElementAudioSourceNode;

	audioObjectURL: string | null = null;

	constructor() {
		const ctx = new AudioContext();
		const mediaElement = new Audio();

		const track = new MediaElementAudioSourceNode(ctx, {
			mediaElement,
		});

		// Create the node that controls the volume.
		const gainNode = new GainNode(ctx);
		const panner = new StereoPannerNode(ctx, { pan: 0 });

		track.connect(gainNode).connect(panner).connect(ctx.destination);

		this.ctx = ctx;
		this.mediaElement = mediaElement;
		this.track = track;
	}

	async unloadCurrentAudio() {
		if (this.audioObjectURL) {
			URL.revokeObjectURL(this.audioObjectURL);
			this.audioObjectURL = null;
		}
	}

	async loadAudio(file: File) {
		await this.unloadCurrentAudio();

		const { ctx, mediaElement } = this;
		const audioObjectURL = URL.createObjectURL(file);

		this.audioObjectURL = audioObjectURL;

		mediaElement.src = audioObjectURL;

		if (ctx.state === "suspended") {
			ctx.resume();
		}
	}
	async getWaveformData(file: File, samples: number) {
		const buffer = await file.arrayBuffer();
		const decodedAudio = await this.ctx.decodeAudioData(buffer);

		return transformDecodedAudioToWaweformData(decodedAudio, samples);
	}

	play() {
		if (this.mediaElement.ended) {
			this.mediaElement.fastSeek(0);
		}

		this.mediaElement.play();
	}

	pause() {
		this.mediaElement.pause();
	}
}

const transformDecodedAudioToWaweformData = (
	audioBuffer: AudioBuffer,
	samples: number,
) => {
	const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
	const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision

	const sampledData = new Array(samples);
	let max = 0;

	for (let i = 0; i < samples; i++) {
		const blockStart = blockSize * i; // the location of the first sample in the block
		let sum = 0;
		for (let j = 0; j < blockSize; j++) {
			sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
		}
		const sampledValue = sum / blockSize; // divide the sum by the block size to get the average

		if (max < sampledValue) {
			max = sampledValue;
		}

		sampledData[i] = sampledValue;
	}

	const multiplier = max ** -1;

	for (let i = 0; i < samples; i++) {
		sampledData[i] = sampledData[i] * multiplier;
	}

	return sampledData;
};
