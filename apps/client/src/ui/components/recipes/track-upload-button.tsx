import { PlusCircledIcon } from "@radix-ui/react-icons";
import { useMusicCollection } from "@/data/useMusicCollection";
import { Button } from "../ui/button";

export function TrackUploadButton() {
	const musicCollection = useMusicCollection();

	async function handleFileLoad(evt: React.ChangeEvent<HTMLInputElement>) {
		await musicCollection.addFilesToCollection(evt.target.files);

		evt.target.value = "";
	}

	return (
		<Button asChild className="hover:cursor-pointer flex items-center">
			<label className="flex items-center">
				<input type="file" onChange={handleFileLoad} multiple hidden />
				<PlusCircledIcon className="mr-2 h-4 w-4" />
				Add Files
			</label>
		</Button>
	);
}
