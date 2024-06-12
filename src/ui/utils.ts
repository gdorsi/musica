import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function copyToClipboard(props: {
	textToCopy: string | undefined;
	toastText: string;
}) {
	if (props.textToCopy) {
		navigator.clipboard.writeText(props.textToCopy);
		toast(props.toastText);
	}
}
