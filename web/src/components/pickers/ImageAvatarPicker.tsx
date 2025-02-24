'use client'

import { Avatar, AvatarVariant } from '@/types/schema'
import { createImageAvatar, getPaletteColors } from '@/utils/image'
import { AddPhotoAlternate, RemoveCircle } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Avatar as MuiAvatar, AvatarProps, Box, Button, FormHelperText, Stack } from '@mui/material'
import { useMemo, useRef, useState } from 'react'
import ColorPicker from './ColorPicker'

interface ImageAvatarPicker {
	value: Avatar
	onChange: (avatar: Avatar | null) => void
}

interface ImageAvatarProps extends AvatarProps {
	avatar: Avatar
}

export const ImageAvatar = (props: ImageAvatarProps) => {
	const { avatar, ...rest } = props

	return <MuiAvatar variant="rounded" src={avatar.content} {...rest} />
}

export default function ImageAvatarPicker(props: ImageAvatarPicker) {
	const [uploading, setUploading] = useState<boolean>(false)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [paletteColors, setPaletteColors] = useState<string[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)

	console.log(paletteColors)

	const hasImageIcon = useMemo(() => {
		return [
			Boolean(props.value),
			Boolean(props.value?.content),
			props.value?.variant === AvatarVariant.Enum.IMAGE,
		].every(Boolean)
	}, [props.value])

	const handleRemoveImage = () => {
		props.onChange(null)
	}

	const handleClickUploadButton = () => {
		fileInputRef?.current?.click()
	}

	const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			setUploading(true)
			setUploadError(null)

			try {
				const imageAvatar = await createImageAvatar(file)
				const paletteColors = await getPaletteColors(file)
				setPaletteColors(paletteColors)
				props.onChange({ ...imageAvatar, primaryColor: paletteColors[0] })
			} catch (err) {
				setUploadError((err as Error).message)
			} finally {
				setUploading(false)
			}
		}
	}

	return (
		<Box p={2}>
			<input
				type="file"
				onChange={handleFileChange}
				disabled={uploading}
				style={{ display: 'none' }}
				ref={fileInputRef}
			/>
			<Stack direction="row" sx={{ mb: 1 }} gap={2}>
				{hasImageIcon && (
					<>
						<ImageAvatar
							avatar={props.value}
						/>
						<ColorPicker
							color={props.value.primaryColor}
							onChange={(color) => props.onChange({ ...props.value, primaryColor: color })}
							swatches={paletteColors.map((color: string) => ({ color, name: '' }))}
							disabled={!paletteColors.length}
						/>
						<Button variant="text" onClick={() => handleRemoveImage()} startIcon={<RemoveCircle />}>
							Remove
						</Button>
					</>
				)}
				<LoadingButton onClick={handleClickUploadButton} loading={uploading} startIcon={<AddPhotoAlternate />}>
					{hasImageIcon ? 'Replace Image' : 'Add Image'}
				</LoadingButton>
			</Stack>
			{uploadError && <FormHelperText error>{uploadError}</FormHelperText>}
		</Box>
	)
}
