import { JournalEntryContext } from "@/contexts/JournalEntryContext"
import { EntryType } from "@/types/schema"
import { Category, ChevronRight } from "@mui/icons-material"
import { ListItemButton, ListItemIcon, ListItemText, Menu } from "@mui/material"
import { useContext } from "react"

interface JournalFilterConfig {
    maxTransactionAmount: number
    minTransactionAmount: number
}

export interface JournalAllFilters {
    categories: string[]
    entryType: EntryType
    entryTags: string[]
    hasAttachments: boolean
    dateBefore: string
    dateAfter: string
    transactionAmountRange: [number, number]
}

export type JournalFilters = Partial<JournalAllFilters>

interface JournalFiltersProps {
    anchorEl: Element | null
    onClose: () => void
    filterConfig: JournalFilterConfig
}

export default function JournalFilters(props: JournalFiltersProps) {
    const journalEntryContext = useContext(JournalEntryContext);

    return (
        <Menu anchorEl={props.anchorEl} open={Boolean(props.anchorEl)} onClose={() => {}}>
            <ListItemButton onClick={() => {}}>
                <ListItemIcon>
                    <Category />
                </ListItemIcon>
                <ListItemText primary="Category" />
                <ChevronRight />
            </ListItemButton>
        </Menu>
    )
}
