import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField } from "@mui/material";
import { FormEvent, useState } from "react";

export interface ZiskServerSetupForm {
    username: string;
    password: string;
}


interface ServerSetupModalProps {
    open: boolean
    onSubmit: (formValues: ZiskServerSetupForm) => Promise<void>
    onClose: () => void
}

export default function ServerSetupModal(props: ServerSetupModalProps) {
    const [formValues, setFormValues] = useState<ZiskServerSetupForm>({
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState<boolean>(false)

    const setUsername = (newUsername: string) => {
        setFormValues((prev) => ({ ...prev, username: newUsername }))
    }

    const setPassword = (newPassword: string) => {
        setFormValues((prev) => ({ ...prev, password: newPassword }))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setLoading(true)
        props.onSubmit(formValues)
            .then(() => {
                props.onClose()
            })
            .catch(() => {
                setLoading(false)
            })
    }

    const { username, password } = formValues

    return (
        <Dialog open={props.open} onClose={() => props.onClose()}>
            <DialogTitle>Set Up Your Server</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <DialogContentText>Welcome to your Zisk Server! Please continue with your first-time setup before logging in.</DialogContentText>
                    <Stack gap={1} sx={{ mt: 2 }}>
                        <TextField
                            label='Username'
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label='Password'
                            type='password'
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            fullWidth
                            required
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' type='submit'>Submit</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
