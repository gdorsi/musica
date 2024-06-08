export class AudioManager {
	ctx: AudioContext;
	mediaElement: HTMLAudioElement;
	track: MediaElementAudioSourceNode;
	gainNode: GainNode;
	panner: StereoPannerNode;

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
		this.gainNode = gainNode;
		this.panner = panner;
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

	play() {
		this.mediaElement.play();
	}

	pause() {
		this.mediaElement.pause();
	}
}
