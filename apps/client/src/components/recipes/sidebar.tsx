import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface Playlist {
	name: string;
}

interface PlaylistListProps {
	playlists: [string, Playlist][];
}

export function Sidebar({ playlists }: PlaylistListProps) {
	const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

	return (
		<div className={cn("pb-12")}>
			<div className="space-y-4 py-4">
				<div className="px-3 py-2">
					<Link to={"/"}>
						<Button
							className="w-full justify-start"
							variant={selectedPlaylist === null ? "secondary" : "ghost"}
							onClick={() => setSelectedPlaylist(null)}
						>
							<h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
								All Tracks
							</h2>
						</Button>
					</Link>
				</div>
				<Separator />
				<div className="py-2">
					<h2 className="relative px-7 text-lg font-semibold tracking-tight">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-2 h-4 w-4"
							aria-label="playlists"
						>
							<title>playlists</title>
							<path d="M21 15V6" />
							<path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
							<path d="M12 12H3" />
							<path d="M16 6H3" />
							<path d="M12 18H3" />
						</svg>
						Playlists
					</h2>

					<ScrollArea className="h-[300px] px-1">
						<div className="space-y-1 p-2">
							{playlists.map(([documentId, playlist]) => (
								<Link
									key={documentId}
									to={`/playlist/${documentId}`}
									className="w-full"
								>
									<Button
										variant={
											selectedPlaylist === documentId ? "secondary" : "ghost"
										}
										className="w-full justify-start"
										onClick={() => setSelectedPlaylist(documentId)}
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="mr-2 h-4 w-4"
											aria-label="albums"
										>
											<title>albums</title>
											<path d="m16 6 4 14" />
											<path d="M12 6v14" />
											<path d="M8 8v12" />
											<path d="M4 4v16" />
										</svg>
										{playlist.name}
									</Button>
								</Link>
							))}
						</div>
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
