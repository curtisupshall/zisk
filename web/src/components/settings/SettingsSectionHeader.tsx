import { Divider, Stack, Typography } from "@mui/material";


interface SettingsSectionHeaderProps {
    title: string;
}

export default function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
    return (
        <Stack gap={1} mb={2}>
            <Typography variant='h5'>
                {title}
            </Typography>
            <Divider />
        </Stack>
    )
}
