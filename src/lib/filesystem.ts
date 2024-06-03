// Load the files selected with an input type="file" into the origin
// private filesystem in order to make them easy to retrieve in the future
export async function copyToPrivateFileSystem(target: HTMLInputElement) {
  const files = target.files;

  if (!files) {
    return [];
  }

  const root = await navigator.storage.getDirectory();
  const handles: FileSystemFileHandle[] = [];

  for (const file of files) {
    const fileHandle = await root.getFileHandle(file.name, {
      create: true,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(await file.arrayBuffer());
    await writable.close();

    handles.push(fileHandle);
  }

  return handles;
}

// Loads a file from the origin private filesystem into an audio node
// TODO: Create an high-level orchestrator for audio files
export async function loadAudio(ctx: AudioContext, fileName: string) {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName);

  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

  // Create source node
  const source = ctx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(ctx.destination);

  return source;
}
