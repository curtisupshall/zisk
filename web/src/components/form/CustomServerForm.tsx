import { Add } from "@mui/icons-material";
import { Button, Grid2 as Grid, Stack, TextField, Typography } from "@mui/material";


export default function CustomServerForm() {

    return (
        <Grid container columns={12} gap={1} alignItems={'center'}>
            <Grid size={4}>
                <TextField
                    label='Label'
                    variant='filled'
                    size='small'
                    fullWidth
                    />
            </Grid>
            <Grid size='grow'>
                <TextField
                    label='URL'
                    variant='filled'
                    size='small'
                    fullWidth
                />
            </Grid>
            <Grid size='auto'>
                <Button startIcon={<Add />} type='submit' variant='outlined'>
                    Add
                </Button>
            </Grid>
        </Grid>
    )
}
