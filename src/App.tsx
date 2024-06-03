import { useDocument } from "@automerge/automerge-repo-react-hooks";
import { Documents, MusicCollectionDocument } from "./state/repository";
import { copyToPrivateFileSystem, loadAudio } from "./lib/filesystem";
import { useState } from "react";

// TODO Move this into a React Context
const ctx = new window.AudioContext();

function App(props: { documents: Documents }) {
  const [audio, setAudio] = useState<AudioBufferSourceNode | null>(null);
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

  async function handlePlayAudio(fileName: string) {
    if (audio) {
      audio.disconnect();
    }

    const nextAudio = await loadAudio(ctx, fileName);

    nextAudio.start();
    setAudio(nextAudio);
    ctx.resume();
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
          <button onClick={() => handlePlayAudio(item.fileName)}>
            {item.title}
          </button>
        ))}
      </div>
      <button onClick={() => ctx.suspend()}>Pause</button>
      <button onClick={() => ctx.resume()}>Play</button>
    </>
  );
}

export default App;
