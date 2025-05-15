import { ZiskMeta } from "@/schema/documents/ZiskMeta";
import { UserSettings } from "@/schema/models/UserSettings";
import { DefinedUseQueryResult, UseQueryResult } from "@tanstack/react-query";
import { createContext } from "react";

export interface ZiskContext {
    queries: {
        ziskMeta: UseQueryResult<ZiskMeta | null, Error>
    },
    updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const ZiskContext = createContext<ZiskContext>({
    queries: {
        ziskMeta: {} as DefinedUseQueryResult<ZiskMeta | null, Error>
    },
    updateSettings: () => Promise.resolve(),
})
