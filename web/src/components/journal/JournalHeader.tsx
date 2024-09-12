import { JournalDate } from "@/types/calendar";
import { getJournalDateUrl, getNextYearMonth, getPreviousYearMonth, getTodayYearAndMonth } from "@/utils/Utils";
import { Apps, ArrowBack, ArrowForward, EventRepeat, Today } from "@mui/icons-material";
import { Button, ButtonBase, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { PropsWithChildren } from "react";

type JournalHeaderProps = PropsWithChildren<JournalDate>;

export default function JournalHeader({ month, year, children }: JournalHeaderProps) {
    return (
        <Stack direction='row' justifyContent='space-between' sx={{ flex: 1 }} alignItems='center'>
            <Stack direction='row' alignItems='center' gap={2}>
                <Stack direction='row' alignItems='center' gap={1}>
                    <Stack direction='row'>
                        <Link href={getJournalDateUrl(getPreviousYearMonth({ year, month }))}>
                            <IconButton>
                                <ArrowBack />
                            </IconButton>
                        </Link>
                        <Link href={getJournalDateUrl(getNextYearMonth({ year, month }))}>
                            <IconButton>
                                <ArrowForward />
                            </IconButton>
                        </Link>
                    </Stack>
                    <Typography variant='h5' sx={{ fontWeight: 500 }}>
                        {dayjs([year, month].join('-')).format('MMMM YYYY')}
                    </Typography>
                </Stack>
                <Link href={'/journal'}>
                    <Tooltip title='Today'>
                        <IconButton color='inherit'>
                            <EventRepeat />
                        </IconButton>
                    </Tooltip>
                </Link>
            </Stack>
            <Stack direction='row' alignItems='center' gap={2}>
                {children}
            </Stack>
        </Stack>
    )
}
