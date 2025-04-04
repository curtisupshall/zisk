import type { PropsWithChildren } from 'react'
import { Box, CssBaseline, Stack, ThemeProvider } from '@mui/material'
import appTheme from '../theme'
import { unbounded } from '../fonts/unbounded'

import '../main.scss';

export const metadata = {
  title: 'Zisk',
  description: 'The open-source, local-first personal finance app',
}

export default async (props: PropsWithChildren) => {
	return (
		<html lang='en'>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" />
				<link rel="icon" href="/images/logo/logo-mark.svg" type="image/svg+xml" />
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100..900&display=swap"
				/>
			</head>
			<body className={unbounded.className}>
				<ThemeProvider theme={appTheme}>
          			<CssBaseline />
					{props.children}
				</ThemeProvider>
			</body>
		</html>
	)
}

