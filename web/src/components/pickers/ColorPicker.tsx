'use client'

import { FormControl, MenuItem, Paper, Select, Tooltip } from '@mui/material'
import * as _muiColors from '@mui/material/colors'

const muiColors = { ..._muiColors } as unknown as Record<string, Record<number, string>>

const colorGroups = [
	[
		'red',
		'pink',
		'purple',
		// 'deepPurple',
		'indigo',
		'blue',
		// 'lightBlue',
		'cyan',
		'teal',
	],
	[
		'green',
		'lightGreen',
		'lime',
		// 'yellow',
		'amber',
		// 'orange',
		'deepOrange',
		'brown',
		// 'grey',
		'blueGrey',
	],
]

export const colorNameLabels: Record<string, string> = {
	red: 'Red',
	pink: 'Pink',
	purple: 'Purple',
	indigo: 'Indigo',
	blue: 'Blue',
	cyan: 'Cyan',
	teal: 'Teal',
	green: 'Green',
	lightGreen: 'Sage',
	lime: 'Lime',
	amber: 'Amber',
	deepOrange: 'Orange',
	brown: 'Brown',
	blueGrey: 'Grey',
}

const colorShades = [200, 400, 800]

export const colorShadeLabels: Record<number, string> = {
	[200]: 'Light',
	[400]: '',
	[800]: 'Deep',
}

interface SwatchProps {
	color: string
	name?: string
	onClick?: () => void
}

const sortedColors = colorGroups.reduce((colors: [string, number][], colorGroup: string[]) => {
	colorShades.forEach((shade) => {
		colorGroup.forEach((colorName) => {
			colors.push([colorName, shade])
		})
	})

	return colors
}, [])

export const Swatch = (props: SwatchProps) => {
	const Children = (
		<Paper
			className="swatch"
			component={'i'}
			onClick={props.onClick}
			sx={{
				display: 'block',
				m: 0.25,
				width: '18px',
				height: '18px',
				borderRadius: '50%',
				backgroundColor: props.color,
				transition: 'all 0.2s',
			}}
			elevation={props.onClick ? 3 : 0}
		/>
	)

	if (props.name) {
		return (
			<Tooltip
				title={props.name}
				disableInteractive
				placement="top"
				slotProps={{
					popper: {
						modifiers: [
							{
								name: 'offset',
								options: {
									offset: [0, -14],
								},
							},
						],
					},
				}}>
				{Children}
			</Tooltip>
		)
	}

	return Children
}

export interface ColorPickerProps {
	color: string | null
	onChange: (color: string) => void
	swatches?: SwatchProps[]
	disabled?: boolean
}

const DEFAULT_COLOR = muiColors['red'][400]

export default function ColorPicker(props: ColorPickerProps) {
	const color = props.color || DEFAULT_COLOR

	const swatches = props.swatches ?? sortedColors
		.map(([colorName, shade]) => {
			const color = muiColors[colorName][shade]
			const colorNameParts = [colorShadeLabels[shade], colorNameLabels[colorName]].filter(Boolean)
			if (colorNameParts[1]) {
				colorNameParts[1] = String(colorNameParts[1]).toLowerCase()
			}

			return { color,  name: colorNameParts.join(' ') }
		})

	return (
		<FormControl>
			<Select
				size="small"
				value={color}
				disabled={props.disabled}
				onChange={(event) => {
					props.onChange?.(event.target.value)
				}}
				renderValue={() => {
					return <Swatch color={color} />
				}}
				MenuProps={{
					slotProps: {
						paper: {
							sx: { px: 1, py: 0.5 },
						},
					},

					MenuListProps: {
						sx: {
							display: 'grid',
							gridTemplateColumns: 'repeat(7, 1fr)',
						},
					},
				}}
				slotProps={{
					input: {
						sx: {
							minWidth: 60,
						},
					},
				}}>
				{swatches.map((swatch: SwatchProps) => {
					// const color = muiColors[colorName][shade]
					// const colorNameParts = [colorShadeLabels[shade], colorNameLabels[colorName]].filter(Boolean)
					// if (colorNameParts[1]) {
						// colorNameParts[1] = String(colorNameParts[1]).toLowerCase()
					// }

					return (
						<MenuItem
							value={swatch.color}
							key={swatch.color}
							disableTouchRipple
							sx={{
								p: 0,
								'&:hover, &:focus, &.Mui-selected': {
									background: 'none !important', // Disable background color change
									color: 'inherit', // Disable color change
								},
								'&:not(:hover) .swatch': {
									boxShadow: 'none !important',
								},
								'&:hover .swatch, &.Mui-focusVisible .swatch': {
									width: '22px',
									height: '22px',
									margin: 0,
								},
							}}>
							<Swatch {...swatch} />
						</MenuItem>
					)
				})}
			</Select>
		</FormControl>
	)
}
