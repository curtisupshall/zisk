import { RemoteContext, SyncErrorEnum, SyncStatusEnum } from "@/contexts/RemoteContext";
import { PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from "react";
import PouchDB from 'pouchdb'
import { ZiskContext } from "@/contexts/ZiskContext";
import { getServerDatabaseUrl } from "@/utils/server";
import { usernameToDbName } from "@/utils/database";
import { getDatabaseClient } from "@/database/client";
import { UserSettings } from "@/schema/models/UserSettings";

const ZISK_CLOUD_HOST = '' // process.env.NEXT_PUBLIC_ZISK_CLOUD_HOST
const ENABLE_ZISK_CLOUD = false // process.env.NEXT_PUBLIC_F_ENABLE_ZISK_CLOUD === 'true'

interface UserContext {
    name: string | null
    roles: string[]
}

export default function RemoteContextProvider(props: PropsWithChildren) {
    const [syncError, setSyncError] = useState<SyncErrorEnum | null>(null)
    const [syncStatus, setSyncStatus] = useState<SyncStatusEnum>(SyncStatusEnum.IDLE)
    // const [customServerUserContext, setCustomServerUserContext] = useState<UserContext | null>(null);

    const remoteDb = useRef<PouchDB.Database | null>(null)

    const ziskContext = useContext(ZiskContext)
    const settings: UserSettings | null = ziskContext?.data?.userSettings ?? null

    const sync = async () => {
        if (!remoteDb.current) {
            return
        }
        setSyncStatus(SyncStatusEnum.SAVING)
        setSyncError(null)
        try {
            // Perform sync
            const db = getDatabaseClient()
            await db.sync(remoteDb.current)
        } catch (_error: any) {
            // setSyncError(error.message)
            setSyncStatus(SyncStatusEnum.FAILED_TO_SAVE)
            return
        }
        setSyncStatus(SyncStatusEnum.SAVED_TO_REMOTE)
    }

    const getCustomServerUserContext = async (serverUrl: string): Promise<UserContext | null> => {
        let response
        const databaseUrl = getServerDatabaseUrl(serverUrl)
        const sessionUrl = [databaseUrl, '_session'].filter(Boolean).join('/')
        try {
            response = await fetch(sessionUrl, { credentials: 'include' })
        } catch {
            return null
        }

        if (!response.ok) {
            return null
        }
        const jsonData = await response.json()
        return jsonData.userCtx
    }

    const couchDbDatabaseExists = async (syncUrl: string): Promise<boolean> => {
        let response
        try {
            response = await fetch(syncUrl, {  credentials: 'include' })
        } catch {
            return false
        }

        if (!response.ok) {
            return false
        }

        return true
    }

    const initRemoteConnectionFromConfig = async (settings: UserSettings)  => {
        console.log('Initializing remote connection from config')

        const { syncingStrategy, server } = settings

        if (syncingStrategy.strategyType === 'LOCAL') {
            setSyncStatus(SyncStatusEnum.WORKING_LOCALLY)
            return
        } else if (syncingStrategy.strategyType === 'COUCH_DB') {
            remoteDb.current = new PouchDB(syncingStrategy.couchDbUrl)
        } else if (syncingStrategy.strategyType === 'CUSTOM_SERVER_OR_ZISK_CLOUD') {
            if (server.serverType === 'NONE') {
                setSyncError(SyncErrorEnum.MISSING_SERVER_URL_IN_CONFIG)
                setSyncStatus(SyncStatusEnum.FAILED_TO_CONNECT)
                return
            } else if (server.serverType === 'ZISK_CLOUD') {
                if (!ENABLE_ZISK_CLOUD || !ZISK_CLOUD_HOST) {
                    setSyncError(SyncErrorEnum.ZISK_CLOUD_DISABLED)
                    setSyncStatus(SyncStatusEnum.FAILED_TO_CONNECT)
                    return
                }
                setSyncStatus(SyncStatusEnum.CONNECTING_TO_REMOTE)
                // TODO
            } else if (server.serverType === 'CUSTOM') {
                if (!server.serverUrl) {
                    setSyncError(SyncErrorEnum.MISSING_SERVER_URL_IN_CONFIG)
                    setSyncStatus(SyncStatusEnum.FAILED_TO_CONNECT)
                    return
                }
                
                // Get session data
                const userContext = await getCustomServerUserContext(server.serverUrl)
                if (!userContext?.name) {
                    setSyncError(SyncErrorEnum.UNAUTHENTICATED)
                    setSyncStatus(SyncStatusEnum.FAILED_TO_CONNECT)
                    return
                }

                const syncUrl = [
                    getServerDatabaseUrl(server.serverUrl),
                    usernameToDbName(userContext.name),
                ].filter(Boolean).join('/')

                const databaseExists = await couchDbDatabaseExists(syncUrl)
                if (!databaseExists) {
                    setSyncError(SyncErrorEnum.MISSING_DATABASE)
                    setSyncStatus(SyncStatusEnum.FAILED_TO_CONNECT)
                    return
                }

                remoteDb.current = new PouchDB(syncUrl)
            }
        }

        setSyncStatus(SyncStatusEnum.IDLE)
        return sync()
    }

    const syncSupported = useMemo(() => {
        if (!settings) {
            return false
        }
        return settings.syncingStrategy.strategyType !== 'LOCAL'
    }, [settings])

    useEffect(() => {
        if (!settings) {
            return
        }
        initRemoteConnectionFromConfig(settings)
    }, [settings])

    const remoteContext = {
        syncError,
        syncStatus,
        syncSupported,
        sync,
    }

    return (
        <RemoteContext.Provider value={remoteContext}>
            {props.children}
        </RemoteContext.Provider>
    )
}
