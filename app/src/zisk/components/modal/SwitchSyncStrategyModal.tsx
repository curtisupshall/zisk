import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Stack, TextField, ToggleButtonGroup } from "@mui/material";
import RadioToggleButton from "../input/RadioToggleButton";
import { useContext, useEffect, useMemo, useState } from "react";
import ServerWidget from "../widget/ServerWidget";
import { Shuffle } from "@mui/icons-material";
import { ZiskContext } from "@/contexts/ZiskContext";
import { LoadingButton } from "@mui/lab";
import { isValidUrl } from "@/utils/server";
import { testCouchDbConnection } from "@/utils/database";
import { UserSettings } from "@/schema/models/UserSettings";

type SyncStrategyType = 'LOCAL' | 'CUSTOM_SERVER_OR_ZISK_CLOUD' | 'COUCH_DB'

interface SwitchSyncStrategyModalProps {
    open: boolean
    onClose: () => void
}

export default function SwitchSyncStrategyModal(props: SwitchSyncStrategyModalProps) {
    const ziskContext = useContext(ZiskContext)
    const settings: UserSettings | undefined = ziskContext.data?.userSettings
    const currentServer = settings?.server
    const currentSyncStrategy = settings?.syncingStrategy
    
    const [strategy, setStrategy] = useState<SyncStrategyType>(currentSyncStrategy?.strategyType ?? 'LOCAL')
    const [loading, setLoading] = useState<boolean>(false)
    const [couchDbError, setCouchDbError] = useState<boolean>(false)
    const [couchDbUrl, setCouchDbUrl] = useState<string>(
        (currentSyncStrategy?.strategyType === 'COUCH_DB' && currentSyncStrategy.couchDbUrl)
        || ''
    )

    const handleSwitch = async () => {
        if (strategy === 'COUCH_DB') {
            // Test the CouchDB connection before switching
            setLoading(true)
            
            if (!(await testCouchDbConnection(couchDbUrl))) {
                setLoading(false)
                setCouchDbError(true)
                return
            }

            await ziskContext.updateSettings({
                syncingStrategy: {
                    strategyType: 'COUCH_DB',
                    couchDbUrl,
                }
            })
        } else if (strategy === 'CUSTOM_SERVER_OR_ZISK_CLOUD') {
            await ziskContext.updateSettings({
                syncingStrategy: {
                    strategyType: 'CUSTOM_SERVER_OR_ZISK_CLOUD'
                }
            })
        } else if (strategy === 'LOCAL') {
            await ziskContext.updateSettings({
                syncingStrategy: {
                    strategyType: 'LOCAL'
                }
            })
        }
        setLoading(false)
        props.onClose()
    }

    const couchDbUrlIsValid = useMemo(() => {
        if (isValidUrl(couchDbUrl)) {
            return true
        }
        return false
    }, [couchDbUrl])

    const disableSwitchButton = useMemo(() => {
        if (currentSyncStrategy?.strategyType === strategy) {
            return true
        } else if (strategy === 'COUCH_DB' && !couchDbUrlIsValid) {
            return true
        }

        return false
    }, [currentSyncStrategy, strategy, couchDbUrlIsValid])

    useEffect(() => {
        setCouchDbError(false)
    }, [couchDbUrl])

    useEffect(() => {
        if (props.open) {
            setStrategy(currentSyncStrategy?.strategyType ?? 'LOCAL')
        }
    }, [currentSyncStrategy])

    return (
        <Dialog open={props.open} onClose={() => props.onClose()} fullWidth maxWidth='sm'>
            <DialogTitle>Switch Sync Strategy</DialogTitle>
            <DialogContent>
                <Stack gap={2}>
                    <ToggleButtonGroup
                        orientation="vertical"
                        exclusive
                        value={strategy}
                        onChange={(_event, newValue) => setStrategy(newValue)}
                    >
                        <RadioToggleButton
                            description="Your data will only be saved locally."
                            heading="Local (No Syncing)"
                            value="LOCAL"
                            selected={strategy === 'LOCAL'}
                        />
                        <RadioToggleButton
                            disabled={currentServer?.serverType === 'NONE'}
                            description="Your data will be synced to and maintained by your Zisk Server. You must be signed into Zisk Cloud or a Zisk Server."
                            heading="Server"
                            value="CUSTOM_SERVER_OR_ZISK_CLOUD"
                            selected={strategy === 'CUSTOM_SERVER_OR_ZISK_CLOUD'}
                        />
                        <RadioToggleButton
                            description="Your data will be synced with a self-hosted or cloud-hosted instance of CouchDB provided by you."
                            heading="CouchDB"
                            value="COUCH_DB"
                            selected={strategy === 'COUCH_DB'}
                        />
                    </ToggleButtonGroup>
                    {strategy === 'LOCAL' && currentSyncStrategy?.strategyType === 'CUSTOM_SERVER_OR_ZISK_CLOUD' && (
                        <Alert severity="info">You will remain signed into your Zisk Server.</Alert>
                    )}
                    {strategy === 'CUSTOM_SERVER_OR_ZISK_CLOUD' && (
                        <>
                            {currentServer?.serverType === 'CUSTOM' && (
                                <Paper variant='outlined' sx={(theme) => ({ background: 'none', borderRadius: theme.shape.borderRadius, alignSelf: 'flex-start' })}>
                                    <ServerWidget
                                        serverUrl={currentServer.serverUrl}
                                        serverName={currentServer.serverName}
                                        serverNickname={currentServer.serverNickname}
                                        userName={currentServer.user.username}
                                    />
                                </Paper>
                            )}
                        </>
                    )}
                    {strategy === 'COUCH_DB' && (
                        <Stack gap={2}>
                            <DialogContentText>Enter the fully qualified URL for your CouchDB instance, including its port number.</DialogContentText>
                            <TextField
                                label={'CouchDB URL'}
                                fullWidth
                                error={couchDbError}
                                value={couchDbUrl}
                                onChange={(event) => setCouchDbUrl(event.target.value)}
                                helperText={couchDbError ? 'Failed to validate your CouchDB instance.' : undefined}
                            />
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <LoadingButton
                    variant='contained'
                    onClick={() => handleSwitch()}
                    disabled={disableSwitchButton}
                    loading={loading}
                    startIcon={<Shuffle />}
                >
                    Switch
                </LoadingButton>
                <Button onClick={() => props.onClose()}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
