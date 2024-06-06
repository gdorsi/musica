import { useMediaPlayer } from "./hooks/useMediaPlayer";
import {
	type MusicCollectionItem,
	useMusicCollection,
} from "./state/musicCollection";

function App() {
	const mediaPlayer = useMediaPlayer();
	const { useLiveQuery, addFilesToTheCollection } = useMusicCollection();
	const musicCollection = useLiveQuery<MusicCollectionItem>("title");

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		const files = evt.target.files;

		if (!files || !files.length) return;

		await addFilesToTheCollection(files);

		// reset the files input
		evt.target.value = "";
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
				{musicCollection.docs.map((item) => (
					<button
						type="button"
						key={item._id}
						onClick={() => mediaPlayer.playMedia(item)}
						disabled={item.fileName === mediaPlayer.currentMedia}
					>
						{item.title}
					</button>
				))}
			</div>
			<button
				type="button"
				onClick={mediaPlayer.togglePlayState}
				disabled={!mediaPlayer.currentMedia}
			>
				{mediaPlayer.playState === "pause" ? "Play" : "Pause"}
			</button>
		</>
	);
}

export default App;
