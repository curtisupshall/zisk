import z from "zod"
import { Avatar } from "../models/Avatar"

export const CloudZiskServer = z.object({
	serverType: z.literal('ZISK_CLOUD'),
	user: z.object({
		username: z.string(),
		avatar: Avatar,
	})
})

export type CloudZiskServer = z.output<typeof CloudZiskServer>

export const NoneZiskServer = z.object({
	serverType: z.literal('NONE')
})

export type NoneZiskServer = z.output<typeof NoneZiskServer>

export const CustomZiskServer = CloudZiskServer.merge(z.object({
	serverType: z.literal('CUSTOM'),
	serverUrl: z.string(),
	serverName: z.string().optional(),
	serverNickname: z.string().optional(),
}))

export type CustomZiskServer = z.output<typeof CustomZiskServer>

export const ZiskServer = z.union([
	CustomZiskServer,
	NoneZiskServer,
	CloudZiskServer,
])

export type ZiskServer = z.output<typeof ZiskServer>

export const CouchDbSyncingStrategy = z.object({
	strategyType: z.literal('COUCH_DB'),
	couchDbUrl: z.string(),
})

export type CouchDbSyncingStrategy = z.output<typeof CouchDbSyncingStrategy>

export const LocalSyncingStrategy = z.object({
	strategyType: z.literal('LOCAL'),
})

export type LocalSyncingStrategy = z.output<typeof LocalSyncingStrategy>

export const ServerSyncingStrategy = z.object({
	strategyType: z.literal('CUSTOM_SERVER_OR_ZISK_CLOUD'),
	// serverUrl: z.string(),
})

export type ServerSyncingStrategy = z.output<typeof ServerSyncingStrategy>

export const SyncingStrategy = z.union([
	LocalSyncingStrategy,
	ServerSyncingStrategy,
	CouchDbSyncingStrategy,
])

export type SyncingStrategy = z.output<typeof SyncingStrategy>

