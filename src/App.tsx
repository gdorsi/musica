import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { Documents, MusicCollectionDocument } from "./state/repository";
import { copyToPrivateFileSystem } from "./lib/filesystem";
import { useMediaPlayer } from "./hooks/useMediaPlayer";

function App(props: { documents: Documents }) {
  const mediaPlayer = useMediaPlayer();
  const [doc, change] = useDocument<MusicCollectionDocument>(
    props.documents.musicCollection
  );

  async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
    const files = await copyToPrivateFileSystem(evt.target);

    evt.target.value = "";

    if (!files.length) return;

    change(({ collection }) => {
      for (const file of files) {
        if (collection.some((item) => item.fileName === file.name)) {
          continue;
        }

        collection.push({
          fileName: file.name,
          // Remove the file extension on the title
          title: file.name.replace(/\..+?$/, ""),
        });
      }
    });
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
        {doc?.collection.map((item) => (
          <button
            key={item.fileName}
            onClick={() => mediaPlayer.playMedia(item.fileName)}
            disabled={item.fileName === mediaPlayer.currentMedia}
          >
            {item.title}
          </button>
        ))}
      </div>
      <button
        onClick={mediaPlayer.togglePlayState}
        disabled={!mediaPlayer.currentMedia}
      >
        {mediaPlayer.playState === "pause" ? "Play" : "Pause"}
      </button>
    </>
  );
}

export default App;
