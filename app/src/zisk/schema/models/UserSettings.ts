
import { Model } from "@/schema/support/orm/Model";
import { z } from "zod";
import { SyncingStrategy, ZiskServer } from "../support/server";

export const [CreateUserSettings, UserSettings] = Model.fromSchema({
	kind: z.literal('zisk:usersettings'),
	
	appearance: z.object({
		// theme: z.union([z.literal('LIGHT'), z.literal('DARK'), z.literal('SYSTEM')]),
		// animations: z.union([z.literal('NORMAL'), z.literal('FAST'), z.literal('OFF')]),
		menuExpanded: z.boolean(),
	}),
	server: ZiskServer,
	syncingStrategy: SyncingStrategy,
})

export type CreateUserSettings = z.output<typeof CreateUserSettings>;
export type UserSettings = z.output<typeof UserSettings>;
