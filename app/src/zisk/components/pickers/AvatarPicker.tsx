import { Box, colors, Fade, Icon, Popover, Select, Tab, Tabs } from '@mui/material'
import { useState } from 'react'
import IconPicker from './IconPicker'
import ImageAvatarPicker, { ImageAvatar } from './ImageAvatarPicker'
import { Avatar, AvatarVariant } from '@/schema/models/Avatar'

interface AvatarPickerProps {
	value: Avatar | null
	onChange: (avatar: Avatar) => void
}

export const DEFAULT_AVATAR: Avatar = {
	kind: 'zisk:avatar',
	content: 'layers',
	variant: AvatarVariant.enum.PICTORIAL,
	primaryColor: colors.grey[500],
}

const renderAvatarItem = (avatar: Avatar) => {
	switch (avatar.variant) {
		case AvatarVariant.enum.PICTORIAL:
			return <Icon sx={{ color: avatar.primaryColor }}>{avatar.content}</Icon>
		case AvatarVariant.enum.IMAGE:
			return <ImageAvatar avatar={avatar} sx={{ my: -0.5, width: '32px', height: '32px' }} />
		default:
			return null
	}
}

export default function AvatarPicker(props: AvatarPickerProps) {
	const [anchorEl, setAnchorEl] = useState<Element | null>(null)
	const [currentTab, setCurrentTab] = useState<number>(0)

	const displayIcon: Avatar = props.value ?? DEFAULT_AVATAR
	const open = Boolean(anchorEl)

	const handleChange = (avatar: Avatar | null) => {
		props.onChange(avatar ?? DEFAULT_AVATAR)
	}

	return (
		<>
			<Select
				onClick={(event) => {
					setAnchorEl(event.currentTarget)
				}}
				multiple
				readOnly
				value={displayIcon}
				renderValue={(value) => {
					return <Box sx={{ '& > *': { my: -0.5 } }}>{renderAvatarItem(value)}</Box>
				}}
			/>
			<Popover
				TransitionComponent={Fade}
				open={open}
				anchorEl={anchorEl}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}>
				<Box px={2} pt={1}>
					<Tabs value={currentTab} onChange={(_event, newValue) => setCurrentTab(newValue)}>
						<Tab label="Icon" />
						{/* <Tab disabled label='Emoji' />
                        <Tab disabled label='Letters' /> */}
						<Tab label="Image" />
					</Tabs>
				</Box>
				{currentTab === 0 && (
					<IconPicker
						value={displayIcon.variant === 'IMAGE' ? DEFAULT_AVATAR : displayIcon}
						onChange={handleChange}
					/>
				)}
				{currentTab === 1 && <ImageAvatarPicker value={displayIcon} onChange={handleChange} />}
			</Popover>
		</>
	)
}
