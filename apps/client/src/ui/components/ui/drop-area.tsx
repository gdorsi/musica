import { cn } from "@/ui/utils";

type FileDropAreaProps = {
	onDrop: (files: FileList) => void;
	children: React.ReactNode;
	className?: string;
};

export function FileDropArea({
	children,
	onDrop,
	className,
}: FileDropAreaProps) {
	function handleDrop(evt: React.DragEvent) {
		evt.preventDefault();

		if (evt.dataTransfer.files) {
			onDrop(evt.dataTransfer.files);
		}
	}

	function handleDragOver(evt: React.DragEvent) {
		evt.preventDefault();
	}

	return (
		<div
			className={cn(className)}
			onDrop={handleDrop}
			onDragOver={handleDragOver}
		>
			{children}
		</div>
	);
}
