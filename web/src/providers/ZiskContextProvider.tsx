import { ZiskContext } from "@/contexts/ZiskContext"
import { updateSettings } from "@/database/actions"
import { getOrCreateZiskMeta } from "@/database/queries"
import { ZiskMeta, ZiskSettings } from "@/types/schema"
import { useQuery } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"

export default function ZiskContextProvider(props: PropsWithChildren) {
    const [ziskMeta, setZiskMeta] = useState<ZiskMeta | null>(null)

    const getZiskMetaQuery = useQuery<ZiskMeta | null>({
        queryKey: ['ziskMeta'],
        queryFn: getOrCreateZiskMeta,
        initialData: null,
        enabled: true,
    })

    const updateZiskSettings = async (settings: ZiskSettings): Promise<void> => {
        setZiskMeta((prev) => {
            if (!prev) {
                return null
            }
            return {
                ...prev,
                settings,
            }
        })
        await updateSettings(settings)
    }

    useEffect(() => {
        setZiskMeta(getZiskMetaQuery.data)
    }, [getZiskMetaQuery.data])

    const context: ZiskContext = {
        data: ziskMeta,
        updateSettings: updateZiskSettings,
    }

    return (
        <ZiskContext.Provider value={context}>
            {props.children}
        </ZiskContext.Provider>
    )
}
