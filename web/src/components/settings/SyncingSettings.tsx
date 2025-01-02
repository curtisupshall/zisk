import { Alert, AlertTitle, Box, Button, Link, Stack, Typography } from "@mui/material"
import SettingsSectionHeader from "./SettingsSectionHeader"
import React, { useContext, useMemo, useState } from "react"
import CustomServerForm from "../form/CustomServerForm"
import { SyncingStrategy } from "@/types/schema"
import { ZiskContext } from "@/contexts/ZiskContext"
import CustomSyncWizardModal from "../modal/CustomSyncWizardModal"

const POUCH_DB_DOCS_URL = 'https://pouchdb.com/'

export default function SyncingSettings() {
    const ziskContext = useContext(ZiskContext)
    const [showCustomSyncWizardModal, setShowCustomSyncWizardModal] = useState<boolean>(false)
    if (!ziskContext.data) {
        return React.Fragment;
    }
    
    const syncStrategy: SyncingStrategy = ziskContext.data.settings.syncingStrategy

    const handleSwitchToLocal = () => {

    }

    const handleSwitchToCustomServer = () => {
        setShowCustomSyncWizardModal(true)
    }

    return (
        <>
            <CustomSyncWizardModal
                open={showCustomSyncWizardModal}
                onClose={() => setShowCustomSyncWizardModal(false)}
            />
            <Stack spacing={2}>
                <section>
                    <SettingsSectionHeader title='Syncing Strategy' />
                    <Typography variant="body2" mb={2}>
                        Zisk uses <Link href={POUCH_DB_DOCS_URL}>PouchDB</Link> to store your journals. You can choose to keep your journals on this device only or sync them with a custom server.
                    </Typography>
                    <Stack component='section' gap={1} mb={2}>
                        <Typography variant='h6'>Local Storage</Typography>
                        <Typography variant="body2">
                            Local Storage means your journals are stored on this device only. They are not synced with other devices or backed up.
                        </Typography>
                        {syncStrategy.strategy === 'LOCAL' ? (
                            <Alert severity="success">Your journals are stored on this device only.</Alert>
                        ) : (
                            <Alert
                                severity="info"
                                action={
                                    <Button onClick={() => handleSwitchToLocal()}>
                                        Switch to Local Storage
                                    </Button>
                                }
                            >
                                <AlertTitle>Switch to Local Storage</AlertTitle>
                                Your journals will be stored on this device only. They will not be synced with other devices or backed up.
                            </Alert>
                        )}
                    </Stack>
                    <Stack component='section' gap={1}>
                        <Typography variant='h6'>Custom Server</Typography>
                        <Typography variant="body2">
                            Custom Server means your journals are stored on a server of your choice.
                        </Typography>
                        {syncStrategy.strategy === 'CUSTOM' ? (
                            <Alert severity="success">Your journals are stored on a custom server.</Alert>
                        ) : (
                            <Alert
                                severity="info"
                                action={
                                    <Button variant='contained' onClick={() => handleSwitchToCustomServer()}>
                                        Switch
                                    </Button>
                                }
                            >
                                <AlertTitle>Switch to Custom</AlertTitle>
                                Your journals will be stored on a custom server. You can host your own or use a service like Cloudant.
                            </Alert>
                        )}
                    </Stack>
                </section>
                {/* <section>
                    <SettingsSectionHeader title='Your Custom Servers' />
                    <Typography variant="body2" mb={2}>
                        A custom server allows you to host your own Zisk server and sync your journals with it. This is useful if you want to keep your data private and secure. <Link href={ZISK_CLOUD_DOCS_URL}>Learn more</Link>
                    </Typography>
                    <Box py={1}>
                        <CustomServerForm />
                    </Box>
                </section> */}
            </Stack>
        </>
    )
}