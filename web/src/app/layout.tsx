import { CssBaseline, Stack, ThemeProvider } from '@mui/material'
import type { PropsWithChildren } from 'react'
import appTheme from '@/components/theme/theme'
import { montserrat } from '@/fonts/montserrat';

import '@/styles/main.scss';

export default async (props: PropsWithChildren) => {
	return (
		<html
			lang='en'
			className={montserrat.className}
		>
			<head>
				<title>Zisk</title>
				<link rel="icon" href="favicon.ico" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/icon?family=Material+Icons"
				/>
			</head>
			<body>
				<ThemeProvider theme={appTheme}>
					<CssBaseline />
					<Stack component='main' id='root' minHeight='100dvh'>
						{props.children}
					</Stack>
				</ThemeProvider>
			</body>
		</html>
	)
}
