import { S, TypedObject } from "@dxos/echo-schema";

export class MusicCollectionItem extends TypedObject({
	typename: "musica/type/MusicCollectionItem",
	version: "0.2.0",
})({
	type: S.string,
	title: S.string,
	file: S.struct({
		name: S.string,
		content: S.string,
		type: S.string,
	}),
}) {}
