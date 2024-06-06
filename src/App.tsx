import { copyToPrivateFileSystem } from "./lib/filesystem";
import { useMediaPlayer } from "./hooks/useMediaPlayer";
import { useMusicCollection } from "./state/musicCollection";
import { mediaCollectionFileToFile } from "./lib/file";
import { useShareSpace } from "./hooks/useShareSpace";
import { useJoinSpace } from "./hooks/useJoinSpace";
import type { MusicCollectionItem } from "./state/types";

export function App() {
	const mediaPlayer = useMediaPlayer();
	const share = useShareSpace();
	const join = useJoinSpace();

	const { addFilesToCollection, collection, activeMedia, setActiveMedia } =
		useMusicCollection(join.spaceKey);

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		await copyToPrivateFileSystem(evt.target);
		addFilesToCollection(evt.target.files);

		evt.target.value = "";
	}

	async function handleMediaSelect(item: MusicCollectionItem) {
		setActiveMedia(item);

		const file = await mediaCollectionFileToFile(item.file);

		await mediaPlayer.playMedia(file);
	}

	return (
		<>
			<label style={{ position: "fixed", right: 10, top: 10 }}>
				<input type="file" onChange={handleFileLoad} multiple />
			</label>
			<div
				// TODO: Select the styles library (vanilla extract?)
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "100%",
					height: "100%",
				}}
			>
				My collection:{" "}
				{collection.map((item) => (
					<button
						type="button"
						key={item.id}
						onClick={() => handleMediaSelect(item)}
						disabled={item.id === activeMedia?.id}
					>
						{item.title}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={mediaPlayer.togglePlayState}
				disabled={!activeMedia}
			>
				{mediaPlayer.playState === "pause" ? "Play" : "Pause"}
			</button>
			<button type="button" onClick={share.createNewInvitation}>
				Share
			</button>

			{share.url && (
				<div>
					Invitation created
					<div>
						<button type="button" onClick={share.copy}>
							Copy URL
						</button>
						<button type="button" onClick={share.cancel}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</>
	);
}
