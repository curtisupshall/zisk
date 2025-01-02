'use client'

import { montserrat } from '@/fonts/montserrat'
import { createTheme } from '@mui/material'

/**
 * The MUI app theme, which is consumed by the MUI ThemeProvider component.
 */
const appTheme = createTheme({
	palette: {
		mode: 'dark',
		// primary:{
		//     main: 'rgb(251, 202, 4)'
		// }
	},
	// colorSchemes: {
	//     light: {
	//         palette: {
	//             mode: 'light',
	//             primary:{
	//                 main: 'rgb(85, 42, 90)',
	//             }
	//         },
	//     },
	//     dark: {
	//         palette: {
	//             mode: 'dark',
	//             primary:{
	//                 main: 'rgb(208, 165, 213)',
	//             }
	//         },
	//     }
	// },
	typography: {
		fontFamily: montserrat.style.fontFamily,
	},
	components: {
		MuiBreadcrumbs: {
            styleOverrides: {
                li: {
                    fontWeight: 600
                }
            }
        },
		MuiButton: {
			styleOverrides: {
				root: {
					// borderRadius: 28,
					textTransform: 'unset',
				},
			},
		},
		MuiFab: {
			styleOverrides: {
				root: {
					textTransform: 'unset',
				},
			},
		},
		MuiDialog: {
			styleOverrides: {
				root: {
					// Target the backdrop of the dialog
					'& .MuiBackdrop-root': {
						backdropFilter: 'blur(8px)',
						// backgroundColor: 'rgba(0, 0, 0, 0.125)',
					},
				},
			},
		},
		MuiDrawer: {
			styleOverrides: {
				root: {
					'& .MuiBackdrop-root': {
						backdropFilter: 'blur(8px)', // Apply blur directly to the drawer content
					},
				},
			},
		},
		MuiLink: {
			styleOverrides: {
				root: {
					cursor: 'pointer',
				}
			}
		},
		MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    minWidth: '0 !important',
                },
				
            }
        },
		MuiToggleButton: {
            styleOverrides: {
                root: {
                    'textTransform': 'none'
                }
            }
        },
	},
})

export default appTheme
