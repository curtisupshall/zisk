import { LoadingButton } from "@mui/lab";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, Link, TextField, ToggleButtonGroup } from "@mui/material";
import { useMemo, useState } from "react";
import RadioToggleButton from "../input/RadioToggleButton";

function isAbsoluteUrl(url: string): boolean {
    try {
      // Use the URL constructor to validate the URL
      const parsedUrl = new URL(url);
  
      // Check if the URL has a valid protocol (http, https, etc.)
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      // If URL constructor throws an error, the URL is not valid
      return false;
    }
  }

export default function CustomSyncWizardModal(props: DialogProps) {
    const [step, setStep] = useState<number>(0)
    const [serverUrl, setServerUrl] = useState<string>("http://localhost:5984")
    const [urlIsApproved, setUrlIsApproved] = useState<boolean>(false)
    const [databaseIsApproved, setDatabaseIsApproved] = useState<boolean>(false)
    const [serverCheckError, setServerCheckError] = useState<string | null>(null)
    const [serverCheckLoading, setServerCheckLoading] = useState<boolean>(false)
    const [databaseCheckError, setDatabaseCheckError] = useState<string | null>(null)
    // const [databaseCheckLoading, setDatabaseCheckLoading] = useState<boolean>(false)
    // const [setupMode, setSetupMode] = useState<'auto' | 'manual'>('auto')
    const [databaseName, setDatabaseName] = useState<string>('')

    const handleCheckUrl = async () => {
        if (!isAbsoluteUrl(serverUrl)) {
            console.log('Invalid URL')
            setServerCheckError('Please enter a valid URL')
            return
        }
        setServerCheckError(null)
        setServerCheckLoading(true)
        try {
            const response = await fetch(`${serverUrl}/_up`, {
                method: 'GET',
            })

            console.log(response)
        
            if (!response.ok) {
                setServerCheckError(`Health check failed with status: ${response.status}`)
            } else {
                setUrlIsApproved(true)
            }
        } catch (error: any) {
            console.error('Health check failed with error:', error);
            setServerCheckError('Health check on the server failed. Please check the server URL and try again.');
        } finally {
            setServerCheckLoading(false)
        }
    }

    const handleCheckDatabase = async () => {
        if (!databaseName) {
            setDatabaseCheckError('Please enter a database name')
            return
        }

    }


    const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        setServerUrl(e.target.value)
        setUrlIsApproved(false)
        setServerCheckError(null)
    }

    const handleChangeDatabaseName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDatabaseName(e.target.value)
        setDatabaseIsApproved(false)
        setDatabaseCheckError(null)
    }

    const handleNext = () => {
        setStep(step + 1)
    }

    const handleBack = () => {
        setStep(step - 1)
    }

    const disableNext = useMemo(() => {
        return step === 0 && (!urlIsApproved)
    }, [step, serverUrl, serverCheckError, urlIsApproved])

    return (
        <Dialog {...props}>
            <DialogTitle>Custom Server Syncing</DialogTitle>
            {step === 0 && (
                <DialogContent>
                    <DialogContentText>A Custom Server will allow you to sync your journals.</DialogContentText>
                    <Alert severity="info">
                        You will need a <Link>compatible version</Link> of CouchDB.
                    </Alert>
                    <TextField
                        label="Server URL"
                        placeholder="http://myserver.com:5984"
                        fullWidth
                        variant="filled"
                        autoComplete="off"
                        value={serverUrl}
                        onChange={handleChangeUrl}
                        color={urlIsApproved ? 'success' : (serverCheckError ? 'error' : undefined)}
                        helperText={serverCheckError ?? (urlIsApproved ? 'Server OK!' : undefined)}
                    />
                    <LoadingButton loading={serverCheckLoading} onClick={handleCheckUrl}>Check Status</LoadingButton>
                </DialogContent>
            )}
            {step === 1 && (
                <DialogContent>
                    <DialogContentText>Setup your database.</DialogContentText>
                    <TextField
                        label="Database Name"
                        value={databaseName}
                        onChange={handleChangeDatabaseName}
                        fullWidth
                        variant="filled"
                        autoComplete="off"
                        error={Boolean(databaseCheckError)}
                        helperText={databaseCheckError ?? (databaseIsApproved ? 'Database OK!' : undefined)}
                    />
                    <Button onClick={handleCheckDatabase}>Check Database</Button>

                    {/* <ToggleButtonGroup
                        value={setupMode}
                        exclusive
                        orientation="vertical"
                        onChange={(_e, value) => setSetupMode(value)}
                    >
                        <RadioToggleButton
                            value="auto"
                            heading="Auto"
                            description="We'll try to set up your server automatically."
                        />
                        <RadioToggleButton
                            value="manual"
                            heading="Manual"
                            description="You'll need to set up your database and admin credentials manually."
                        />
                    </ToggleButtonGroup> */}
                    <TextField
                        label="Username"
                        fullWidth
                        variant="filled"
                        autoComplete="off"
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        variant="filled"
                        autoComplete="off"
                        type="password"
                    />
                </DialogContent>
            )}
            <DialogActions>
                {step > 0 && (
                    <Button onClick={handleBack}>Back</Button>
                )}
                <Button onClick={handleNext} disabled={disableNext}>Next</Button>
            </DialogActions>
        </Dialog>
    )
}