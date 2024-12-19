import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { Drawer, IconButton, Stack } from "@mui/material";
import { PropsWithChildren } from "react";

interface DetailsDrawerProps extends PropsWithChildren {
    open: boolean;
    actions?: React.ReactNode;
    onClose: () => void;
}

export default function DetailsDrawer(props: DetailsDrawerProps) {
    return (
        <Drawer anchor="right" open={props.open} onClose={props.onClose}>
            <Stack direction='row' alignItems='center' justifyContent='space-between' p={2}>
                <Stack direction='row' alignItems='center'>
                    <IconButton onClick={props.onClose}>
                        <KeyboardDoubleArrowLeft />
                    </IconButton>
                </Stack>
                {props.actions && (
                    <Stack direction='row' alignItems='center'>
                        {props.actions}
                    </Stack>
                )}
            </Stack>
            {/* <Divider /> */}
            {props.children}
        </Drawer>
    )
}
