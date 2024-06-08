import { registerUser } from "@/state/auth";
import type React from "react";
import { Button } from "../components/ui/button";
import { useId } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { z } from "zod";
import type { AuthData } from "@/state/auth";

const NameSchema = z.string();

export function Registration(props: { onSuccess: (auth: AuthData) => void }) {
	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (evt) => {
		evt.preventDefault();

		const formData = new FormData(evt.currentTarget);

		const name = NameSchema.parse(formData.get("name"));

		const auth = await registerUser(name);
		props.onSuccess(auth);
	};

	const id = useId();

	return (
		<Card className="w-[350px] m-auto">
			<CardHeader>
				<CardTitle>Create a new account</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					className="grid w-full items-center space-y-3"
					onSubmit={handleSubmit}
				>
					<div className="flex flex-col space-y-1.5">
						<Label htmlFor={id}>Your name</Label>
						<Input id={id} name="name" required autoComplete="off" />
					</div>

					<Button type="submit">Register</Button>
				</form>
			</CardContent>
		</Card>
	);
}
