import Header from "@/components/nav/header/Header";
import AppMenu from "@/components/nav/menu/AppMenu";
import { Paper, Stack } from "@mui/material";
import { PropsWithChildren } from "react";

export const MainLayout = (props: PropsWithChildren) => {
    const { children } = props;

	return (
		<Stack component='main' sx={{ minHeight: '100dvh' }}>
			<Header />
            <Stack direction='row' sx={{ flex: 1, gap: 0 }}>
                <AppMenu view={'desktop'} />
			    <Paper sx={(theme) => ({
                    flex: 1,
                    borderTopLeftRadius: theme.spacing(2)
                })}>
                    {children}
                </Paper>
            </Stack>
        </Stack>
	)
}