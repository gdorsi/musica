import { copyToPrivateFileSystem, getFile } from "./lib/filesystem";
import { useMediaPlayer } from "./hooks/useMediaPlayer";
import {
	type MusicCollectionItem,
	useMusicCollection,
} from "./state/musicCollection";

function App() {
	const mediaPlayer = useMediaPlayer();
	const { addFilesToCollection, collection, activeMedia, setActiveMedia } =
		useMusicCollection();

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		await copyToPrivateFileSystem(evt.target);
		addFilesToCollection(evt.target.files);

		evt.target.value = "";
	}

	async function handleMediaSelect(item: MusicCollectionItem) {
		setActiveMedia(item);

		const file = await getFile(item.fileName);
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
						key={item.fileName}
						onClick={() => handleMediaSelect(item)}
						disabled={item.fileName === activeMedia?.fileName}
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
		</>
	);
}

export default App;
