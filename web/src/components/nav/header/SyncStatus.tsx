'use client';

import { CloudDone, CloudOff, CloudSync, Computer, Insights, ReceiptLong, Sync, SyncProblem, UnfoldMore } from "@mui/icons-material";
import { Button, CircularProgress, Collapse, Grow, IconProps, ListItemText, SvgIconOwnProps, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

enum SyncStatusEnum {
    SAVING = 'SAVING',
    SAVED_TO_REMOTE = 'SAVED_TO_REMOTE',
    WORKING_OFFLINE = 'WORKING_OFFLINE',
    WORKING_LOCALLY = 'WORKING_LOCALLY',
    SAVED_TO_THIS_DEVICE = 'SAVED_TO_THIS_DEVICE',
    FAILED_TO_SAVE = 'FAILED_TO_SAVE',
    IDLE = 'IDLE'
}

type IconColor = SvgIconOwnProps['color'];

export default function SyncStatus() {
    const [verbose, setVerbose] = useState<boolean>(false);
    const [syncStatus, setSyncStatus] = useState<SyncStatusEnum>(SyncStatusEnum.SAVING);

    const syncStatusText = useMemo(() => {
        switch (syncStatus) {
            case SyncStatusEnum.SAVING:
                return 'Syncing...';
            case SyncStatusEnum.SAVED_TO_REMOTE:
                return 'Saved to remote';
            case SyncStatusEnum.WORKING_OFFLINE:
                return 'Working offline';
            case SyncStatusEnum.SAVED_TO_THIS_DEVICE:
                return 'Saved to this device';
            case SyncStatusEnum.WORKING_LOCALLY:
                return 'Working locally';
            case SyncStatusEnum.FAILED_TO_SAVE:
                return 'Failed to save';
            case SyncStatusEnum.IDLE:
                return 'Idle';
        }
    }, [syncStatus]);

    const syncIconVerboseColor: IconColor = useMemo(() => {
        switch (syncStatus) {
            case SyncStatusEnum.SAVED_TO_REMOTE:
                return 'success';
            case SyncStatusEnum.WORKING_OFFLINE:
                return 'warning';
            case SyncStatusEnum.FAILED_TO_SAVE:
                return 'error';
            case SyncStatusEnum.SAVED_TO_THIS_DEVICE:
            case SyncStatusEnum.WORKING_LOCALLY:
            case SyncStatusEnum.IDLE:
            case SyncStatusEnum.SAVING:
            default:
                return undefined;
        }
    }, [syncStatus]);

    const ButtonIcon = useMemo(() => {

        const iconColor = syncIconVerboseColor ?? 'inherit';

        switch (syncStatus) {
            case SyncStatusEnum.SAVING:
                return (
                    <Sync color={iconColor} />
                )
            case SyncStatusEnum.SAVED_TO_REMOTE:
                return (
                    <CloudDone color={iconColor} />
                )
            case SyncStatusEnum.WORKING_OFFLINE:
                return (
                    <CloudOff color={iconColor} />
                )
            case SyncStatusEnum.WORKING_LOCALLY:
            case SyncStatusEnum.SAVED_TO_THIS_DEVICE:
                return (
                    <Computer color={iconColor} />
                )
            case SyncStatusEnum.FAILED_TO_SAVE:
                return (
                    <SyncProblem color={iconColor} />
                )
            case SyncStatusEnum.IDLE:
            default:
                break;
        }

        return (
            <CircularProgress size={16} />
        );
    }, [syncIconVerboseColor, verbose]);

    const isIdle = syncStatus === SyncStatusEnum.IDLE;

    if (isIdle) {
        return <></>;
    }

    useEffect(() => {
        // Whenever sync status changes, set verbose to true, then 3s later set it to false
        setVerbose(true);
        const timeout = setTimeout(() => {
            setVerbose(false);
        }, 5000);
        return () => {
            clearTimeout(timeout);
        }
    }, [syncStatus]);

    useEffect(() => {
        setTimeout(() => {
            setSyncStatus(SyncStatusEnum.SAVED_TO_REMOTE);
        }, 1000);

    }, []);

    return (
        <>
            <Button
                variant='text'
                onClick={() => setVerbose(!verbose)}
                sx={(theme) => ({
                    // border: '1px solid',
                    // borderColor: 'rgba(0, 0, 0, 0.23)',
                    color: theme.palette.text.secondary,
                    // backgroundColor: theme.palette.action.hover,
                    borderRadius: 16,
                    py: 0.5,
                    px: 0.5,
                    gap: 0.5,
                    justifyContent: 'flex-start',
                    minWidth: theme.spacing(4),
                    // pr: 8

                    '& .MuiButton-icon': {
                        margin: verbose ? undefined : 0,
                    },
                })}
                // startIcon={ButtonIcon}
            >
                {ButtonIcon}
                {verbose && (
                    <Grow in>
                        <Typography variant="caption" sx={{ mr: 1, userSelect: 'none' }}>
                            {syncStatusText}
                            {/* <Shortcut>Ctrl</Shortcut> */}
                        </Typography>
                    </Grow>
                )}
            </Button>
        </>
    )
}
