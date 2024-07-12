import { Button } from "../ui/button";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "../ui/dialog";
import { copyToClipboard } from "@/utils";
import { useUser } from "@/auth/useUser";

export function ShowDeviceId() {
	const user = useUser();
	const handleJoinClick = async () => {
		handleCopyClick();
	};

	const handleCopyClick = () => {
		copyToClipboard({
			textToCopy: user.id,
			toastText: "Device id copied on the clipboard",
		});
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button onClick={handleJoinClick}>Your device id</Button>
			</DialogTrigger>
			<DialogContent className="max-w-[550px] w-[550px]">
				<DialogHeader>
					<DialogTitle>Share your device id</DialogTitle>
					<DialogDescription className="grid items-center space-y-3">
						<div>This device id</div>
						<div>
							<pre className="border rounded-sm p-2">{user.id}</pre>
						</div>

						<Button onClick={handleCopyClick}>Copy</Button>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
