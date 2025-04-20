import {
    Dialog,
    DialogContent,
    DialogProps,
    Divider,
    Fade,
    Grow,
    IconButton,
    InputAdornment,
    InputBase,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { SearchLaunchButtonProps } from "./SearchLaunchButton";
import { ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Cancel, Search } from "@mui/icons-material";
import { JournalContext } from "@/contexts/JournalContext";
import { getAllJournalObjects } from "@/database/actions";
import Fuse, { FuseResult } from "fuse.js";
import { flattenJournalObjects } from "@/utils/search";
import { Category, ChildJournalEntry, JournalEntry, ZiskDocument } from "@/types/schema";
import { calculateNetAmount, documentIsCategory, documentIsChildJournalEntry, documentIsJournalEntry } from "@/utils/journal";
import { getPriceString } from "@/utils/string";
import AvatarChip from "@/components/icon/AvatarChip";
import AvatarIcon from "@/components/icon/AvatarIcon";
import { PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO } from "@/constants/journal";
import { formatJournalEntryDate } from "@/utils/date";

type SearchModalProps =
    & DialogProps
    & Pick<SearchLaunchButtonProps, 'placeholderText'>
    & {
        open: boolean
        onClose: () => void
    }

const fuseOptions = {
	keys: ['memo', 'amount', 'label'], // Fields to search in
	includeScore: true, // Include the score of how good each match is
	threshold: 0.2, // Tolerance for fuzzy matching
	minMatchCharLength: 1, // Minimum number of characters that must match
}

const Bullet = () => {
    return (
        <span>&bull;</span>
    )
}

export default function SearchModal(props: SearchModalProps) {
    const { placeholderText, ...rest } = props
    const [query, setQuery] = useState<string>('')
    const [results, setResults] = useState<FuseResult<ZiskDocument>[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const fuseRef = useRef<Fuse<any> | null>(null)
    const journalContext = useContext(JournalContext)
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

    const hasError = false

    const handleClear = () => {
        setQuery('')
        inputRef.current?.focus()
    }

    const renderResult = useCallback((result: FuseResult<ZiskDocument>, index: number) => {
        const key = [result.item['_id'], index].filter(Boolean).join('-')
    
        let primaryTextFirstPart: ReactNode | undefined = undefined
        let primaryTextSecondPart: ReactNode | undefined = undefined
        let secondaryTextFirstPart: ReactNode | undefined = undefined
        let secondaryTextSecondPart: ReactNode | undefined = undefined
        let icon: ReactNode | undefined = undefined
        // let link: string | undefined = undefined
        let onClickHandler: (() => void) | undefined = undefined
    
        // Journal Entry or Child Journal Entry
        if (documentIsJournalEntry(result.item)) {
            const netAmount = calculateNetAmount(result.item as JournalEntry)
            const isNetPositive = netAmount > 0
            const { categoryId } = result.item
            const category: Category | undefined = categoryId
                ? journalContext.getCategoriesQuery.data[categoryId]
                : undefined
    
            primaryTextFirstPart = <span>{result.item.memo}</span>
            primaryTextSecondPart = (
                <Typography
                    sx={(theme) => ({
                        color: isNetPositive
                            ? theme.palette.success.main
                            : undefined,
                    })}>
                    {getPriceString(netAmount)}
                </Typography>
            )
            secondaryTextFirstPart = formatJournalEntryDate(result.item.date)
            icon = (
                <AvatarIcon avatar={category?.avatar} />
            )
            onClickHandler = () => {
                journalContext.editJournalEntry(result.item as JournalEntry)
            }
            
        }

        // Category
        else if (documentIsCategory(result.item)) {
            primaryTextFirstPart = <AvatarChip avatar={result.item.avatar} label={result.item.label} icon contrast />
            // link = generateCategoryLink(result.item)
        }
    
        // Child Journal Entry
        if (documentIsChildJournalEntry(result.item)) {
            const parentJournalEntryMemo = result.item.parentEntry.memo ?? PLACEHOLDER_UNNAMED_JOURNAL_ENTRY_MEMO
            secondaryTextSecondPart = <span>Belongs to <strong>{parentJournalEntryMemo}</strong></span>
            onClickHandler = () => {
                journalContext.editJournalEntry((result.item as ChildJournalEntry).parentEntry)
            }
        }

        return (
            <MenuItem key={key} onClick={() => {
                props.onClose?.()
                if (onClickHandler) {
                    onClickHandler()
                }
            }}>
                {icon && (
                    <ListItemIcon>
                        {icon}
                    </ListItemIcon>
                )}
                <ListItemText
                    primaryTypographyProps={{
                        sx: {
                            display: 'flex',
                            gap: 1,
                        }
                    }}
                    primary={
                        <>
                            {primaryTextFirstPart}
                            {primaryTextSecondPart && (
                                <>
                                    <Bullet />
                                    {primaryTextSecondPart}
                                </>
                            )}
                        </>
                    }
                    secondary={
                        <>
                            {secondaryTextFirstPart}
                            {secondaryTextSecondPart && (
                                <>
                                    <Bullet />
                                    {secondaryTextSecondPart}
                                </>
                            )}
                        </>
                    }
                />
            </MenuItem>
        )
    }, [journalContext.getCategoriesQuery.data])

    const fetchResults = () => {
        if (!query) {
            return []
        } else if (!fuseRef.current) {
            return []
        }

        setResults(fuseRef.current.search(query))
    }

    useEffect(() => {
        fetchResults()
    }, [query, props.open])

    useEffect(() => {
        if (!journalContext.journal) {
            return
        }
        getAllJournalObjects(journalContext.journal._id).then((objects) => {
            const flattenedObjects = flattenJournalObjects(objects)
            fuseRef.current = new Fuse(flattenedObjects, fuseOptions)
        })
    }, [props.open, journalContext.journal])

    useEffect(() => {
        if (props.open) {
            setQuery('')
        }
    }, [props.open])

    return (
        <Dialog
            {...rest}
            TransitionComponent={Fade}
            fullWidth
            maxWidth={false}
            PaperProps={{
                sx: {
                    position: 'absolute',
                    top: 16,
                    right: fullScreen ? undefined : 0,
                    left: fullScreen ? undefined : 0,
                    mt: 0.75,
                    mx: fullScreen ? 0 : 16,
                    width: 'unset'
                }
            }}
        >
            <DialogContent sx={{ py: 0 }}>
                <Stack direction='row' gap={1} sx={{ py: 1, position: 'sticky', top: 0, zIndex: 2 }}>
                    <InputAdornment position='start'>
                        <Search />
                    </InputAdornment>
                    <InputBase
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        autoFocus
                        size='small'
                        placeholder={placeholderText ?? 'Search'}
                        fullWidth
                        inputProps={inputRef}
                        error={hasError}
                        sx={{ pb: 0 }}
                        slotProps={{
                            input: {
                                sx: {
                                    pb: 0,
                                }
                            }
                        }}
                        
                    />
                    <Grow in={query.length > 0}>
                        <InputAdornment position='end'>
                            <IconButton onClick={() => handleClear()}>
                                <Cancel fontSize="small"/>
                            </IconButton>
                        </InputAdornment>
                    </Grow>
                </Stack>
            </DialogContent>
            <Divider />
            {results.length === 0 ? (
                <Typography variant='body2' sx={{ p: 2 }}>
                    {query ? <>No results found for <i>{query}</i></> : 'Start typing to search...'}
                </Typography>
            ) : (
                <MenuList>
                    {results.map((result, index) => {
                        return renderResult(result, index)
                    })}
                </MenuList>
            )}
        </Dialog>
    )
}
