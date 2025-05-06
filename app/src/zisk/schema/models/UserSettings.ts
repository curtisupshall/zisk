
import { ModelSchema } from "@/schema/support/orm/Model";
import { z } from "zod";
import { SyncingStrategy, ZiskServer } from "../support/server";

export const UserSettings = ModelSchema.from(
	{
		kind: z.literal('zisk:usersettings')
	},
	z.object({
		appearance: z.object({
			// theme: z.union([z.literal('LIGHT'), z.literal('DARK'), z.literal('SYSTEM')]),
			// animations: z.union([z.literal('NORMAL'), z.literal('FAST'), z.literal('OFF')]),
			menuExpanded: z.boolean(),
		}),
		server: ZiskServer,
		syncingStrategy: SyncingStrategy,
	})
);
export type UserSettings = z.output<typeof UserSettings>;
