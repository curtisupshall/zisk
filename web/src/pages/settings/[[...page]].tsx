import ManageSettings from "@/components/settings/ManageSettings";
import { Container } from "@mui/material";
import { getLayout } from '@/layouts/main'

export default function SettingsPage() {
    return (
        <Container maxWidth="xl" disableGutters sx={{ pt: 1, pl: 1, pr: 3 }}>
            <ManageSettings />
        </Container>
    )
}

SettingsPage.getLayout = getLayout
