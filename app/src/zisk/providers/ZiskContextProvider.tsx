import { ZiskContext } from "@/contexts/ZiskContext"
import { updateSettings } from "@/database/actions"
import { getOrCreateZiskMeta } from "@/database/queries"
import { ZiskMeta } from "@/schema/documents/ZiskMeta"
import { UserSettings } from "@/schema/models/UserSettings"
import { useQuery } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"

export default function ZiskContextProvider(props: PropsWithChildren) {
    const [ziskMeta, setZiskMeta] = useState<ZiskMeta | null>(null)

    const getZiskMetaQuery = useQuery<ZiskMeta | null>({
        queryKey: ['ziskMeta'],
        queryFn: getOrCreateZiskMeta,
        enabled: true,
    })

    const updateZiskSettings = async (newSettings: Partial<UserSettings>): Promise<void> => {
        setZiskMeta((prev) => {
            if (!prev) {
                return null
            }
            return {
                ...prev,
                userSettings: {
                    ...prev.userSettings,
                    ...newSettings,
                }
            }
        })
        await updateSettings(newSettings)
    }

    const context: ZiskContext = {
        queries: {
            ziskMeta: getZiskMetaQuery,
        },
        updateSettings: updateZiskSettings,
    }

    return (
        <ZiskContext.Provider value={context}>
            {props.children}
        </ZiskContext.Provider>
    )
}
