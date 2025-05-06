import { ZiskMeta } from "@/schema/documents/ZiskMeta";
import { UserSettings } from "@/schema/models/UserSettings";
import { createContext } from "react";

export interface ZiskContext {
    data: ZiskMeta | null;
    updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

export const ZiskContext = createContext<ZiskContext>({
    data: null,
    updateSettings: () => Promise.resolve(),
})
