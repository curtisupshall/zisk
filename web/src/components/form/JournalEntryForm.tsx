'use client';

import { Box, Button, Chip, Collapse, Grid2 as Grid, Icon, IconButton, InputAdornment, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Add, Delete, Label } from "@mui/icons-material";
import { Controller, FieldArrayWithId, useFieldArray, UseFieldArrayReturn, useFormContext } from "react-hook-form";
import CategoryAutocomplete from "../input/CategoryAutocomplete";
import { debounce } from "@/utils/Utils";
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from "dayjs";
import TransactionTagPicker from "../pickers/TransactionTagPicker";
import { TRANSACTION_TAG_LABELS } from "@/constants/transactionTags";
import { register } from "module";
import { CreateJournalEntry, JournalEntry } from "@/types/schema";

export default function JournalEntryForm() {
    const { setValue, control, watch, register } = useFormContext<CreateJournalEntry>();
 
    return (
        <>
            <Grid container columns={12} spacing={1} rowSpacing={2} mb={1}>
                <Grid size={8}>
                    <Controller
                        control={control}
                        name='parent.memo'
                        render={({ field }) => (
                            <TextField
                                label='Memo'
                                autoFocus
                                {...field}
                                ref={null}
                                value={field.value}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setValue(field.name, value);
                                    // if (!manuallySetCategory && enableAutoDetectCategory) {
                                    //     handleDetectCategoryWithAi(value);
                                    // }
                                }}
                                fullWidth
                                multiline
                                maxRows={3}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                </Grid>
                <Grid size={4}>
                    <Controller
                        control={control}
                        name='parent.amount'
                        render={({ field }) => (
                            <TextField
                                label='Amount'
                                {...field}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    const newValue = value.replace(/[^0-9.]/g, '') // Remove non-numeric characters except the dot
                                        .replace(/(\..*?)\..*/g, '$1') // Allow only one dot
                                        .replace(/(\.\d{2})\d+/g, '$1'); // Limit to two decimal places
                                    field.onChange(newValue);
                                }}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                sx={{ flex: 1 }}
                                size="small"
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 4  }}>
                    <Controller
                        control={control}
                        name='parent.date'
                        render={({ field }) => (
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    {...field}
                                    value={dayjs(field.value)}
                                    onChange={(value) => {
                                        setValue(field.name, value?.format('YYYY-MM-DD') ?? '');
                                    }}
                                    format='ddd, MMM D'
                                    label='Date'
                                    slotProps={{
                                        textField:  {
                                            fullWidth: true
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4}}>
                    <Controller
                        control={control}
                        name='parent.categoryIds'
                        render={({ field }) => {
                            const categoryIds = watch('parent.categoryIds');
                            const value = categoryIds?.length > 0 ? categoryIds[0] : null;
                            // TODO update categoryautocomplete to use only categoryId
                            return (
                                // <CategoryAutocomplete
                                //     {...field}
                                //     ref={null}
                                //     value={value}
                                //     onChange={(_event, newValue) => {
                                //         // setManuallySetCategory(Boolean(newValue))
                                //         setValue(field.name, newValue);
                                //     }}
                                // />
                                <p>Categories</p>
                            );
                        }}
                    />
                </Grid>
            </Grid>
            <Box mb={1}>
                <Typography variant='overline'><strong>Money Out</strong></Typography>
            </Box>
        </>
    )
}
