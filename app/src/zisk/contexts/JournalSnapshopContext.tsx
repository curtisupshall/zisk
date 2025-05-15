import { JournalEntry } from "@/schema/documents/JournalEntry";
import { AmountRange, DateView } from "@/schema/support/slice";
import { getAbsoluteDateRangeFromDateView } from "@/utils/date";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { JournalContext } from "./JournalContext";
import { getJournalEntries } from "@/database/queries";


export interface JournalSnapshotContext {
    isLoading: boolean;
}

const JournalSnapshotContext = createContext<JournalSnapshotContext>({
    isLoading: false,
})

interface RouterFilters {
    dateView: DateView
}

interface MemoryFilters {
    amount: AmountRange
}

interface JournalSnapshotContextProviderProps extends PropsWithChildren {
    routerFilters: Partial<RouterFilters>
}

type AllFilters = Partial<
    & RouterFilters
    & MemoryFilters
>

export default function JournalSnapshotContextProvider(props: JournalSnapshotContextProviderProps) {

    const { activeJournalId } = useContext(JournalContext)

    const [memoryFilters, setMemoryFilters] = useState<Partial<MemoryFilters>>({})

    const allFilters: AllFilters = {
        ...props.routerFilters,
        ...memoryFilters,
    }

    const hasMinimalUpstreamFilters: boolean = useMemo(() => {
        return Boolean(activeJournalId)
    }, [allFilters])

    const upstreamJournalEntryQuery = useQuery<JournalEntry[]>({
        queryKey: [],
        queryFn: async (): Promise<JournalEntry[]> => {
            return getJournalEntriesByUpstreamFilters(
                // TODO
            )
        },
        initialData: [],
        enabled: hasMinimalUpstreamFilters,
    })

    const downstreamJournalEntryQuery = useQuery<JournalEntry[]>({
        queryKey: [],
        queryFn: async (): Promise<void> => {
            // TODO
            return
        },
        initialData: [
            // TODO
        ],
        enabled: todo,

    })

    const filters = useMemo(() => {

    }, [])


    const contextValue: JournalSnapshotContext = {

    }
    
    return (
        <JournalSnapshotContext.Provider value={contextValue}>
            {props.children}
        </JournalSnapshotContext.Provider>
    )
}
