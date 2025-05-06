// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     DialogContentText,
//     ToggleButtonGroup,
//     Button,
//     Stack,
//     TextField,
//     Collapse,
//     FormControlLabel,
//     Checkbox,
//     Paper
// } from "@mui/material";
// import { useContext, useEffect, useState } from "react";
// import ServerWidget, { ServerData } from "../widget/ServerWidget";
// import RadioToggleButton from "../input/RadioToggleButton";
// import { LoadingButton } from "@mui/lab";
// import { LeakAdd, LeakRemove } from "@mui/icons-material";
// import { getServerApiUrl, getServerDatabaseUrl, isValidUrl } from "@/utils/server";
// import { NotificationsContext } from "@/contexts/NotificationsContext";
// import { DEFAULT_AVATAR } from "../pickers/AvatarPicker";
// import { ZiskContext } from "@/contexts/ZiskContext";
// import { ZiskSettings } from "@/types/schema";

// interface JoinServerModalProps {
//     open: boolean
//     onClose: () => void
// }



// export default function JoinServerModal(props: JoinServerModalProps) {
//     const [serverUrl, setServerUrl] = useState<string>('http://localhost:6006/')
//     const [serverHealthCheckOk, setServerHealthCheckOk] = useState<boolean>(false)
//     const [serverHealthCheckError, setServerHealthCheckError] = useState<boolean>(false)
//     const [serverData, setServerData] = useState<ServerData | null>(null)
//     const [loadingHealthCheck, setLoadingHealthCheck] = useState<boolean>(false)
//     const [loadingSignIn, setLoadingSignIn] = useState<boolean>(false)
//     const [username, setUsername] = useState<string>('')
//     const [password, setPassword] = useState<string>('')
//     const [serverNickname, setServerNickname] = useState<string>('')
//     const [willUpdateSyncStrategy, setWillUpdateSyncStrategy] = useState<boolean>(true)

//     const { snackbar } = useContext(NotificationsContext)
//     const ziskContext = useContext(ZiskContext)

//     const checkServerHealth = async () => {
//         const versionUrl =  getServerApiUrl(serverUrl)
//         let response

//         try {
//             response = await fetch(versionUrl);
//         } catch {
//             //
//         }

//         if (response?.ok) {
//             const data = await response.json();
//             setServerData(data)
//             setServerHealthCheckOk(true)
//         } else {
//             console.error('Failed to fetch version data');
//             setServerHealthCheckOk(false)
//             setServerHealthCheckError(true)
//         }
//     }

//     const handleCheckServerHealth = async () => {
//         setLoadingHealthCheck(true)
//         setServerHealthCheckError(false)

//         checkServerHealth().finally(() => {
//             setLoadingHealthCheck(false)
//         })
//     }

//     const handleSignIn = async () => {
//         await checkServerHealth()

//         if (!serverHealthCheckOk) {
//             return
//         }

//         const couchDbLoginUrl = [
//             getServerDatabaseUrl(serverUrl),
//             '_session'
//         ].join('/')

//         const credentials = {
//             name: username,
//             password,
//         }

//         // Send username and password as form parameters
//         let response
        
//         try {
//             response = await fetch(couchDbLoginUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//                 body: new URLSearchParams(credentials),
//                 credentials: 'include',
//             });
//         } catch {
//             // Catch handled in following control flow
//         }

//         if (response?.ok) {
//             // Update user's settings to reflect new server, then close the modal
//             const updateSettings: Partial<ZiskSettings> = {
//                 server: {
//                     serverType: 'CUSTOM',
//                     serverUrl: serverUrl,
//                     serverName: serverData?.serverName,
//                     serverNickname,
//                     user: {
//                         avatar: DEFAULT_AVATAR, // TODO
//                         username,
//                     }
//                 },
//             }
//             if (willUpdateSyncStrategy) {
//                 updateSettings.syncingStrategy = {
//                     strategyType: 'CUSTOM_SERVER_OR_ZISK_CLOUD',
//                     // serverUrl,
//                 }
//             }
//             await ziskContext.updateSettings(updateSettings)
//             props.onClose()
//         } else {
//             snackbar({
//                 message: 'Failed to log in. Check your credentials and try again.'
//             })
//         }
//         setLoadingSignIn(false)
//     }

//     const disableSignIn = !username || !password || !serverUrl || !serverHealthCheckOk || !serverUrl

//     useEffect(() => {
//         setServerHealthCheckError(false)
//     }, [serverUrl])

//     return (
//         <Dialog {...props} fullWidth maxWidth={'sm'}>
//             <DialogTitle>Join Server</DialogTitle>
//             <DialogContent>
//                 <DialogContentText>
//                     Text.
//                 </DialogContentText>
//                 <ToggleButtonGroup>
//                     <RadioToggleButton
//                         heading="Zisk Cloud"
//                         description="Zisk Cloud."
//                         value={'CLOUD'}
//                     />
//                     <RadioToggleButton
//                         heading="Zisk Server"
//                         description="A custom server."
//                         value={'SERVER'}
//                     />

//                 </ToggleButtonGroup>
//                 <Stack mt={2} gap={1}>
//                     <TextField
//                         value={serverUrl}
//                         onChange={(event) => setServerUrl(event.target.value)}
//                         label='Server URL'
//                         placeholder='your.server.com'
//                         disabled={serverHealthCheckOk || loadingHealthCheck}
//                         fullWidth
//                         required
//                         error={serverHealthCheckError}
//                         helperText={serverHealthCheckError ? 'Failed to connect to server.' : undefined}
//                     />
//                     <Collapse in={!serverHealthCheckOk}>
//                         <LoadingButton
//                             variant='contained'
//                             onClick={() => handleCheckServerHealth()}
//                             loading={loadingHealthCheck}
//                             disabled={serverHealthCheckOk || !isValidUrl(serverUrl)}
//                         >
//                             Check Server
//                         </LoadingButton>
//                     </Collapse>
//                     <Collapse in={serverHealthCheckOk}>
//                         <Paper variant='outlined' sx={(theme) => ({ background: 'none', borderRadius: theme.shape.borderRadius, alignSelf: 'flex-start' })}>
//                             <ServerWidget
//                                 serverName={serverData?.serverName}
//                                 serverNickname={serverNickname}
//                                 serverUrl={serverUrl}
//                                 userName={username}
//                                 status={serverData?.status}
//                                 version={serverData?.version}
//                                 actions={
//                                     <Button
//                                         onClick={() => setServerHealthCheckOk(false)}
//                                         color='error'
//                                         startIcon={<LeakRemove />}
//                                     >
//                                         Disconnect
//                                     </Button>
//                                 }
//                             />
//                         </Paper>
//                     </Collapse>
//                     <TextField
//                         label='Username'
//                         value={username}
//                         onChange={(event) => setUsername(event.target.value)}
//                         fullWidth
//                         required
//                     />
//                     <TextField
//                         label='Password'
//                         type='password'
//                         value={password}
//                         onChange={(event) => setPassword(event.target.value)}
//                         fullWidth
//                         required
//                     />
//                     <TextField
//                         label='Server Display Name (Optional)'
//                         value={serverNickname}
//                         onChange={(event) => setServerNickname(event.target.value)}
//                         fullWidth
//                         placeholder={serverData?.serverName || undefined}
//                     />
//                     <FormControlLabel
//                         control={
//                             <Checkbox
//                                 checked={willUpdateSyncStrategy}
//                                 onChange={() => setWillUpdateSyncStrategy(!willUpdateSyncStrategy)}
//                             />
//                         }
//                         label="Set my syncing strategy to this server"
//                     />
//                 </Stack>
//             </DialogContent>
//             <DialogActions>
//                 <LoadingButton
//                     variant='contained'
//                     startIcon={<LeakAdd />}
//                     onClick={() => handleSignIn()}
//                     disabled={disableSignIn}
//                     loading={loadingSignIn}
//                 >
//                     Join Server
//                 </LoadingButton>
//                 <Button onClick={() => props.onClose()}>Close</Button>
//             </DialogActions>
//         </Dialog>
//     )
// }
