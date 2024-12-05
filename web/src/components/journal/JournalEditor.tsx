import React, { MouseEvent, useContext, useEffect, useMemo, useState } from "react";
import { alpha, Avatar, Box, Button, Chip, Divider, Fab, Grid2 as Grid, IconButton, List, ListItemIcon, ListItemText, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add } from "@mui/icons-material";
import dayjs from "dayjs";
import JournalHeader from "./JournalHeader";
import SettingsDrawer from "./categories/SettingsDrawer";
import { EnhancedJournalEntry } from "@/types/schema";
import CreateJournalEntryModal from "../modal/CreateJournalEntryModal";
import JournalEntryCard from "./JournalEntryCard";
import { deleteJournalEntry, undeleteJournalEntry } from "@/database/actions";
import { NotificationsContext } from "@/contexts/NotificationsContext";
import JournalEntryList from "./JournalEntryList";
import { JournalContext } from "@/contexts/JournalContext";
import { JournalEntryContext } from "@/contexts/JournalEntryContext";

export type JournalEditorView =
    | 'week'
    | 'month'
    | 'year'

export interface JournalEntrySelection {
    entry: EnhancedJournalEntry | null;
    anchorEl: HTMLElement | null;
}

export default function JournalEditor() {
    const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntrySelection>({
        entry: null,
        anchorEl: null,
    });

    const { snackbar } = useContext(NotificationsContext);
    const { getCategoriesQuery } = useContext(JournalContext);
    const { getEnhancedJournalEntriesQuery } = useContext(JournalEntryContext);

    const currentDayString = useMemo(() => dayjs().format('YYYY-MM-DD'), []);

    const journalGroups = useMemo(() => {
        const entries = getEnhancedJournalEntriesQuery.data;
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

        return groups;
    }, [getEnhancedJournalEntriesQuery.data]);

    const handleClickListItem = (event: MouseEvent<any>, entry: EnhancedJournalEntry) => {
        setSelectedEntry({
            anchorEl: event.currentTarget,
            entry: entry,
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
            getEnhancedJournalEntriesQuery.refetch();
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
        getEnhancedJournalEntriesQuery.refetch();
        handleDeselectListItem();
    }

    // show all docs
    // useEffect(() => {
    //     db.allDocs({ include_docs: true }).then((result) => {
    //         console.log('all docs', result);
    //     });
    // }, []);

    return (
        <>
            <SettingsDrawer
                open={showSettingsDrawer}
                onClose={() => setShowSettingsDrawer(false)}
            />
            <Box
                sx={{
                    px: { sm: 0, }
                }}   
            >
                {selectedEntry.entry && (
                    <JournalEntryCard
                        entry={selectedEntry.entry}
                        anchorEl={selectedEntry.anchorEl}
                        onClose={() => handleDeselectListItem()}
                        onDelete={() => handleDeleteEntry(selectedEntry.entry)}
                        onSave={() => handleSaveEntry()}
                    />
                )}
                <JournalHeader reverseActionOrder />
                <Divider />
                <JournalEntryList
                    journalRecordGroups={journalGroups}
                    onClickListItem={handleClickListItem}
                />
            </Box>
        </>
    );
}
