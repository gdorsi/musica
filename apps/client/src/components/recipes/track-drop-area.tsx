import { useMusicCollection } from "@/data/useMusicCollection";
import { cn } from "@/utils";
import { FileDropArea } from "../ui/drop-area";

type FileDropAreaProps = {
	children: React.ReactNode;
	className?: string;
};

export function TrackDropArea({ children, className }: FileDropAreaProps) {
	const musicCollection = useMusicCollection();

	return (
		<FileDropArea
			className={cn(className)}
			onDrop={musicCollection.addFilesToCollection}
		>
			{children}
		</FileDropArea>
	);
}
