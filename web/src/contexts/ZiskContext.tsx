import { ZiskMeta, ZiskSettings } from "@/types/schema";
import { createContext } from "react";

export interface ZiskContext {
    data: ZiskMeta | null;
    updateSettings: (settings: ZiskSettings) => Promise<void>;
}

export const ZiskContext = createContext<ZiskContext>({
    data: null,
    updateSettings: () => Promise.resolve(),
})
