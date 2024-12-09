import useQueryFilters from "@/hooks/useQueryFilters"
import { Category, ChevronRight } from "@mui/icons-material"
import { ListItemButton, ListItemIcon, ListItemText, Menu } from "@mui/material"

interface JournalFilterConfig {
    maxTransactionAmount: number
    minTransactionAmount: number
}

export interface JournalAllFilters {
    categories: string[]
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
    const { setFilters } = useQueryFilters();

    const testClick = () => {
        setFilters({
            categories: ['a', 'b'],
        })
    }

    return (
        <Menu anchorEl={props.anchorEl} open={Boolean(props.anchorEl)} onClose={() => {}}>
            <ListItemButton onClick={() => testClick()}>
                <ListItemIcon>
                    <Category />
                </ListItemIcon>
                <ListItemText primary="Category" />
                <ChevronRight />
            </ListItemButton>
        </Menu>
    )
}
