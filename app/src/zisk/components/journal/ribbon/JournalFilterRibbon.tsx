import AvatarChip from "@/components/icon/AvatarChip"
import { JournalContext } from "@/contexts/JournalContext"
import { JournalSliceContext } from "@/contexts/JournalSliceContext"
import { Add, MonetizationOn, Savings } from "@mui/icons-material"
import { Chip, Collapse, IconButton, Stack, Typography } from "@mui/material"
import { useContext, useRef, useState } from "react"
import JournalFilterPicker from "./JournalFilterPicker"
import { getPriceString } from "@/utils/string"
import { parseJournalEntryAmount } from "@/utils/journal"
import { useGetPriceStyle } from "@/hooks/useGetPriceStyle"
import { Category } from "@/schema/documents/Category"


export default function JournalFilterRibbon() {
    const [showFiltersMenu, setShowFiltersMenu] = useState<boolean>(false)
    const filtersMenuButtonRef = useRef<HTMLButtonElement | null>(null)

    const journalSliceContext = useContext(JournalSliceContext)

    const getPriceStyle = useGetPriceStyle()

    const numFilters: number = journalSliceContext.getActiveFilterSet().size

    const { getCategoriesQuery } = useContext(JournalContext)

    const categoies: Category[] = !journalSliceContext.categoryIds
        ? []
        : journalSliceContext.categoryIds
            .filter(Boolean)
            .map((categoryId) => getCategoriesQuery.data[categoryId])
            .filter(Boolean)

    const handleRemoveCategory = (categoryId: string) => {
        const newCategoryIds = (journalSliceContext.categoryIds ?? [])
            .filter((id) => id !== categoryId)

        journalSliceContext.onChangeCategoryIds(newCategoryIds.length > 0 ? newCategoryIds : undefined)
    }

    const handleRemoveMinimumAmount = () => {
        journalSliceContext.onChangeAmountRange({ ...journalSliceContext.amount, gt: undefined })
    }

    const handleRemoveMaximumAmount = () => {
        journalSliceContext.onChangeAmountRange({ ...journalSliceContext.amount, lt: undefined })
    }

    const amountRange = journalSliceContext.amount
    const parsedMinimumAmount = amountRange && amountRange.gt ? parseJournalEntryAmount(amountRange.gt) : undefined
    const parsedMaximumAmount = amountRange && amountRange.lt ? parseJournalEntryAmount(amountRange.lt) : undefined

    return (
        <>
            <JournalFilterPicker
                anchorEl={filtersMenuButtonRef.current}
                open={showFiltersMenu}
                onClose={() => setShowFiltersMenu(false)}
            />
            <Collapse in={numFilters > 0}>
                <Stack direction='row' sx={{ flexFlow: 'row wrap', px: 2, py: 1 }} gap={0.5}>
                    {categoies.map((category) => {
                        return (
                            <AvatarChip
                                key={category._id}
                                avatar={category.avatar}
                                label={category.label}
                                icon
                                // contrast
                                onDelete={() => handleRemoveCategory(category._id)}
                            />
                        )
                    })}
                    {parsedMinimumAmount !== undefined && (
                        <Chip
                            icon={parsedMinimumAmount > 0 ? <Savings fontSize="small" /> : <MonetizationOn fontSize="small" />}
                            label={
                                <Typography variant="inherit">
                                    More than&nbsp;
                                    <Typography
                                        variant="inherit"
                                        component='span'
                                        sx={{ ...getPriceStyle(parsedMinimumAmount), fontWeight: '600' }}
                                    >
                                        {getPriceString(parsedMinimumAmount)}
                                    </Typography>
                                </Typography>
                            }
                            onDelete={() => handleRemoveMinimumAmount()}
                        />
                    )}
                    {parsedMaximumAmount !== undefined && (
                        <Chip
                            icon={parsedMaximumAmount > 0 ? <Savings fontSize="small" /> : <MonetizationOn fontSize="small" />}
                            label={
                                <Typography variant="inherit">
                                    Less than&nbsp;
                                    <Typography
                                        variant="inherit"
                                        component='span'
                                        sx={{ ...getPriceStyle(parsedMaximumAmount), fontWeight: '600' }}
                                    >
                                        {getPriceString(parsedMaximumAmount)}
                                    </Typography>
                                </Typography>
                            }
                            onDelete={() => handleRemoveMaximumAmount()}
                        />
                    )}

                    <IconButton size='small' ref={filtersMenuButtonRef} onClick={() => setShowFiltersMenu((showing) => !showing)}>
                        <Add fontSize="small" sx={(theme) => ({ color: theme.palette.text.secondary })}/>
                    </IconButton>
                </Stack>
            </Collapse>
        </>
    )
}
