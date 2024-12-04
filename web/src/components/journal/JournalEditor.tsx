import React, { MouseEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { alpha, Avatar, Box, Button, Chip, Divider, Fab, Grid2 as Grid, IconButton, List, ListItemIcon, ListItemText, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, Category as MuiCategoryIcon } from "@mui/icons-material";
import dayjs from "dayjs";
import QuickJournalEditor from "./QuickJournalEditor";
import NotificationsProvider from "@/providers/NotificationsProvider";
import JournalHeader from "./JournalHeader";
import SettingsDrawer from "./categories/SettingsDrawer";
import { Category, EnhancedJournalEntry, JournalEntry } from "@/types/schema";
import CreateJournalEntryModal from "../modal/CreateJournalEntryModal";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getEnhancedJournalEntries } from "@/database/queries";
import CategoryIcon from "../icon/CategoryIcon";
import { getPriceString } from "@/utils/string";
import { db } from "@/database/client";
import CategoryChip from "../icon/CategoryChip";
import JournalEntryCard from "./JournalEntryCard";
import { deleteJournalEntry, undeleteJournalEntry } from "@/database/actions";
import { NotificationsContext } from "@/contexts/NotificationsContext";

const JournalEntryDate = ({ day, isToday }: { day: dayjs.Dayjs, isToday: boolean })  => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Stack direction='row' alignItems='flex-end' gap={0.75} sx={{ p: 1, pb: isSmall ? 0 : undefined }}>
            <Avatar
                component={Button}
                sx={(theme) => ({
                    // display: 'block',
                    background: isToday ? theme.palette.primary.main : 'transparent',
                    color: isToday ? theme.palette.primary.contrastText : 'inherit',
                    minWidth: 'unset',
                    width: isSmall ? theme.spacing(4) : undefined,
                    height: isSmall ? theme.spacing(4) : undefined,
                })}
            >
                {day.format('D')}
            </Avatar>
            <Typography sx={{ mb: isSmall ? -0.25 : 0.25 }} variant='overline' color={isToday ? 'primary' : undefined}>
                {day.format('MMM')},&nbsp;{day.format('ddd')}
            </Typography>
        </Stack>
    )
}

export type JournalEditorView =
    | 'week'
    | 'month'
    | 'year'

export interface JournalEditorProps {
    view: JournalEditorView;
    date: string;
    onNextPage: () => void;
    onPrevPage: () => void;
    onDateChange: (date: string) => void;
}

export interface JournalEntrySelection {
    entry: EnhancedJournalEntry | null;
    anchorEl: HTMLElement | null;
}

export default function JournalEditor(props: JournalEditorProps) {
    const [showJournalEntryModal, setShowJournalEntryModal] = useState<boolean>(false);
    const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntrySelection>({
        entry: null,
        anchorEl: null,
        // children: [],
    });
    const [journalGroups, setJournalGroups] = useState<Record<string, EnhancedJournalEntry[]>>({});

    const { snackbar } = useContext(NotificationsContext);

    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const currentDayString = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

    const getCategoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        initialData: {},
    });

    const getJournalEntriesQuery = useQuery<Record<EnhancedJournalEntry['_id'], EnhancedJournalEntry>>({
        queryKey: ['enhanced-journal-entries', props.view, props.date],
        queryFn: async () => {
            const entries = await getEnhancedJournalEntries(props.view, props.date);

            const groups: Record<string, EnhancedJournalEntry[]> = Object.values(entries)
                .reduce((acc: Record<string, EnhancedJournalEntry[]>, entry: EnhancedJournalEntry) => {
                    const { date } = entry;
                    if (acc[date]) {
                        acc[date].push(entry);
                    } else {
                        acc[date] = [entry];
                    }

                    return acc;
                }, {
                    [currentDayString]: [],
                });

            setJournalGroups(groups);

            return entries;
        },
        initialData: {},
        enabled: true,
    });

    const handleClickListItem = (event: MouseEvent<any>, entry: EnhancedJournalEntry) => {
        const { childEntryIds } = entry;
        // const children: JournalEntry[] = (childEntryIds ?? []).map((childId) => getJournalEntriesQuery.data[childId]);

        setSelectedEntry({
            anchorEl: event.currentTarget,
            entry: entry,
            // children,
        });
    }

    const handleDeselectListItem = () => {
        setSelectedEntry((prev) => {
            const next = {
                ...prev,
                anchorEl: null,
            };
            return next;
        });
    }

    const handleDeleteEntry = async (entry: EnhancedJournalEntry | null) => {
        if (!entry) {
            return;
        }

        try {
            const record = await deleteJournalEntry(entry._id);
            getJournalEntriesQuery.refetch();
            handleDeselectListItem();
            snackbar({
                message: 'Deleted 1 entry',
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        undeleteJournalEntry(record)
                            .then(() => {
                                getCategoriesQuery.refetch();
                                snackbar({ message: 'Category restored' });
                            })
                            .catch((error) => {
                                console.error(error);
                                snackbar({ message: 'Failed to restore category: ' + error.message });
                            });
                    }
                }
            });
        } catch {
            snackbar({ message: 'Failed to delete entry' });
        }
    }

    const handleSaveEntry = () => {
        getJournalEntriesQuery.refetch();
        handleDeselectListItem();
    }

    // show all docs
    useEffect(() => {
        db.allDocs({ include_docs: true }).then((result) => {
            console.log('all docs', result);
        });
    }, []);

    return (
        <>
            <CreateJournalEntryModal
                open={showJournalEntryModal}
                onClose={() => setShowJournalEntryModal(false)}
                onSaved={() => {
                    getJournalEntriesQuery.refetch();
                    setShowJournalEntryModal(false);
                }}
                initialDate={currentDayString}
            />
            <SettingsDrawer
                open={showSettingsDrawer}
                onClose={() => setShowSettingsDrawer(false)}
            />
            <Box
                sx={{
                    px: {
                        sm: 0,
                        // md: 4,
                    }
                }}   
            >
                <Fab
                    color='primary'
                    aria-label='add'
                    onClick={() => setShowJournalEntryModal(true)}
                    variant='extended'
                    size='large'
                    sx={(theme) => ({
                        position: 'fixed',
                        bottom: theme.spacing(4),
                        right: theme.spacing(2),
                    })}
                >
                    <Add />
                    Add
                </Fab>
                {selectedEntry.entry && (
                    <JournalEntryCard
                        entry={selectedEntry.entry}
                        // children={selectedEntry.children}
                        anchorEl={selectedEntry.anchorEl}
                        onClose={() => handleDeselectListItem()}
                        onDelete={() => handleDeleteEntry(selectedEntry.entry)}
                        onSave={() => handleSaveEntry()}
                    />
                )}
                <JournalHeader
                    date={props.date}
                    view={props.view}
                    onNextPage={props.onNextPage}
                    onPrevPage={props.onPrevPage}
                    onDateChange={props.onDateChange}
                    reversed
                />
                <Divider />
                <Grid
                    container
                    columns={12}
                    sx={{
                        '--Grid-borderWidth': '1px',
                        borderColor: 'divider',
                        '& > div': {
                            borderBottom: 'var(--Grid-borderWidth) solid',
                            borderColor: 'divider',

                            '&.date-cell': {
                                borderWidth: {
                                    xs: '0',
                                    sm: '1px'
                                }
                            }
                        },
                    }}
                >
                    {Object
                        .entries(journalGroups)
                        .sort(([dateA, _a], [dateB, _b]) => {
                            return new Date(dateA).getTime() - new Date(dateB).getTime()
                        })
                        .map(([date, entries]) => {
                            const day = dayjs(date);
                            const isToday = day.isSame(dayjs(), 'day');

                            return (
                                <React.Fragment key={date}>
                                    <Grid size={{ xs: 12, sm: 2 }} className='date-cell'>
                                        <JournalEntryDate day={day} isToday={isToday} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 10 }}>
                                        {entries.length > 0 && (
                                            <List sx={{ pl: isSmall ? 1.75 : 1, pt: isSmall ? 0 : undefined }}>
                                                {entries.map((entry) => {
                                                    const { categoryIds } = entry;
                                                    const categoryId: string | undefined = categoryIds?.[0];
                                                    const category: Category | undefined = categoryId ? getCategoriesQuery.data[categoryId] : undefined;
                                                    const netAmount = entry.netAmount
                                                    const isNetPositive = netAmount > 0;

                                                    return (
                                                        <MenuItem
                                                            key={entry._id}
                                                            sx={{ borderRadius: '64px', pl: isSmall ? 4 : undefined }}
                                                            onClick={(event) => handleClickListItem(event, entry)}
                                                        >
                                                            <Grid container columns={12} sx={{ width: '100%', alignItems: 'center' }} spacing={2} rowSpacing={0}>
                                                                <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', flowFlow: 'row nowrap', }}>
                                                                    <ListItemIcon sx={{ display: isSmall ? 'none' : undefined }}>
                                                                        <CategoryIcon category={category} />
                                                                    </ListItemIcon>
                                                                    <ListItemText>{entry.memo}</ListItemText>
                                                                </Grid>
                                                                <Grid size={{ xs: 'auto', sm: 3, md: 2 }}>
                                                                    <ListItemText
                                                                        sx={(theme) => ({ textAlign: 'right', color: isNetPositive ? theme.palette.success.main : undefined })}
                                                                    >
                                                                        {getPriceString(netAmount)}
                                                                    </ListItemText>
                                                                </Grid>
                                                                <Grid size={{ xs: 'grow', sm: 5, md: 6 }}>
                                                                    {category ? (
                                                                        <CategoryChip category={category} />
                                                                    ) : (
                                                                        <Chip
                                                                            sx={ (theme) => ({ backgroundColor: alpha(theme.palette.grey[400], 0.125) })}
                                                                            label='Uncategorized'
                                                                        />
                                                                    )}
                                                                </Grid>
                                                            </Grid>
                                                        </MenuItem>
                                                    )
                                                })}
                                            </List>
                                        )}
                                        {isToday && (
                                            <QuickJournalEditor onAdd={isSmall ? () => setShowJournalEntryModal(true) : undefined} />
                                        )}
                                    </Grid>
                                </React.Fragment>
                            )
                        })
                    }
                </Grid>
            </Box>
        </>
    );
}
