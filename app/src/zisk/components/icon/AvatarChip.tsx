import { alpha, Chip, Icon, useTheme } from '@mui/material'
import AvatarIcon from './AvatarIcon'
import { ReactElement } from 'react'
import { Avatar } from '@/schema/models/Avatar'

interface AvatarChipProps {
	avatar?: Avatar
	label?: string
	contrast?: boolean
	icon?: boolean
	onDelete?: () => void
	deleteIcon?: ReactElement
}

export default function AvatarChip(props: AvatarChipProps) {
	const categoryColor = props.avatar?.primaryColor
	const theme = useTheme()

	let background = undefined;
	let color = undefined;
	if (categoryColor) {
		if (props.contrast) {
			background = categoryColor;
			// use contrast color
			color = theme.palette.getContrastText(categoryColor);
		} else {
			background = alpha(categoryColor, 0.125);
			color = categoryColor;
		}
	}

	return (
		<Chip
			size={props.icon ? undefined : "small"}
			sx={{				
				color,
				background,
				fontWeight: 500,
			}}
			label={props.label}
			icon={props.icon && props.avatar ? (
				<Icon>
					<AvatarIcon avatar={props.avatar} sx={{ color: `${color} !important` }} />
				</Icon>
			) : undefined}
			onDelete={props.onDelete}
			deleteIcon={props.deleteIcon}
		/>
	)
}
