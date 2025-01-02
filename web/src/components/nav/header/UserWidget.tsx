'use client'

import { Menu as MenuIcon } from '@mui/icons-material'
import { Avatar, Badge, Box, Button, Menu, MenuItem, Typography } from '@mui/material'
import { useState } from 'react'

export default function UserWidget() {
	const [anchorEl, setAnchorEl] = useState<Element | null>(null)

	const handleClose = () => {
		setAnchorEl(null)
	}

	const isLoggedIn = false

	const name = ''

	const handleSignIn = () => {
		// handleClose();
	}

	const handleSignOut = () => {
		// handleClose();
	}

	return (
		<>
			<Button
				sx={(theme) => ({ borderRadius: 56, ml: 1, color: theme.palette.grey[500] })}
				onClick={(event) => {
					setAnchorEl(event.currentTarget)
				}}>
				<MenuIcon sx={(theme) => ({ color: theme.palette.grey[500] })} />
				<Badge>
					<Avatar
						sx={(theme) => ({
							background: theme.palette.background.paper,
							outline: `2px solid ${theme.palette.divider}`,
							ml: 1,
							color: theme.palette.text.primary,
						})}
					/>
				</Badge>
			</Button>
			<Menu
				id="header-profile-menu"
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				MenuListProps={{
					sx: { minWidth: 250 },
				}}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorEl={anchorEl}>
				<Box component="li" sx={{ px: 2, pb: 1 }}>
					<Typography variant="subtitle1">
						<strong>{name}</strong>
					</Typography>
				</Box>
				{isLoggedIn ? (
					<MenuItem onClick={() => handleSignOut()}>Sign Out</MenuItem>
				) : (
					<MenuItem onClick={() => handleSignIn()}>Sign In</MenuItem>
				)}
			</Menu>
		</>
	)
}
