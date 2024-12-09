'use client'

import {
	Avatar as MuiAvatar,
	Box,
	Button,
	Card,
	CardMedia,
	Chip,
	Collapse,
	Grid2 as Grid,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { Controller, useFieldArray, UseFieldArrayReturn, useFormContext } from 'react-hook-form'
import CategoryAutocomplete from '../input/CategoryAutocomplete'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { Category, CreateEntryArtifact, CreateJournalEntryForm, EntryTag } from '@/types/schema'
import { Delete, Folder, Label } from '@mui/icons-material'
import { useContext, useMemo, useState } from 'react'
import EntryTagPicker from '../pickers/EntryTagPicker'
import { AttachmentButton, AttachmentDropzone } from '../input/AttachmentPicker'
import { generateArtifactId } from '@/utils/id'
import { formatFileSize } from '@/utils/string'
import { JournalContext } from '@/contexts/JournalContext'

interface JournalEntryChildRowProps {
	index: number
	fieldArray: UseFieldArrayReturn<CreateJournalEntryForm>['fields']
	entryTags: Record<string, EntryTag>
	remove: UseFieldArrayReturn<CreateJournalEntryForm>['remove']
	onClickTagButton: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const JournalEntryChildRow = (props: JournalEntryChildRowProps) => {
	const { setValue, control, watch, register } = useFormContext<CreateJournalEntryForm>()

	const childTagIds = watch(`children.${props.index}.tagIds`) ?? []
	const childTags = childTagIds.map((tagId) => props.entryTags[tagId]).filter(Boolean)
	const hasTags = childTagIds.length > 0
	const categoryIds = (watch(`children.${props.index}.categoryIds`) as string[] | undefined) ?? []
	const categoryId: string | undefined = categoryIds.length > 0 ? categoryIds[0] : undefined

	return (
		<Grid container columns={12} spacing={1} rowSpacing={0} sx={{ alignItems: 'center' }}>
			<Grid size={'grow'}>
				<Controller
					control={control}
					name={`children.${props.index}.amount` as const}
					render={({ field }) => (
						<TextField
							label="Amount"
							{...field}
							onChange={(event) => {
								const value = event.target.value
								const newValue = value
									.replace(/[^0-9.]/g, '') // Remove non-numeric characters except the dot
									.replace(/(\..*?)\..*/g, '$1') // Allow only one dot
									.replace(/(\.\d{2})\d+/g, '$1') // Limit to two decimal places
								field.onChange(newValue)
							}}
							fullWidth
							InputProps={{
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							}}
							sx={{ flex: 1 }}
							size="small"
						/>
					)}
				/>
			</Grid>
			<Grid size={4}>
				<Controller
					control={control}
					name={`children.${props.index}.categoryIds` as const}
					render={({ field }) => (
						<CategoryAutocomplete
							{...field}
							ref={null}
							value={categoryId}
							onChange={(_event, newValue) => {
								setValue(field.name, newValue ? [newValue] : [])
							}}
							label="Category"
							size="small"
						/>
					)}
				/>
			</Grid>
			<Grid size={4}>
				<TextField label="Memo" {...register(`children.${props.index}.memo`)} fullWidth size="small" />
			</Grid>
			<Grid size="auto">
				<Stack direction="row">
					<IconButton onClick={props.onClickTagButton}>
						<Label />
					</IconButton>
					<IconButton onClick={() => props.remove(props.index)} disabled={props.fieldArray.length <= 1}>
						<Delete />
					</IconButton>
				</Stack>
			</Grid>
			<Grid size={12}>
				<Collapse in={hasTags}>
					<Stack gap={1} sx={{ pt: 1.25, pb: 0.75, flexFlow: 'row wrap' }}>
						{childTags.map((entryTag: EntryTag) => {
							return <Chip size="small" key={entryTag._id} label={entryTag.label} />
						})}
					</Stack>
				</Collapse>
			</Grid>
		</Grid>
	)
}

interface AttachmentRowProps {
	onRemove: () => void
	index: number
}

const AttachmentRow = (props: AttachmentRowProps) => {
	const { index, onRemove } = props
	const { watch, register } = useFormContext<CreateJournalEntryForm>()

	const artifact = watch(`artifacts.${index}`)

	// Check if the artifact's file has an content type of image. If so, we create a URL for it
	const imageSrc: string | null = useMemo(() => {
		const attachment = artifact._attachments[artifact.filename]
		if (attachment.content_type.startsWith('image')) {
			const blob = new Blob([attachment.data], { type: attachment.content_type })
			return URL.createObjectURL(blob)
		}

		return null
	}, [artifact])

	return (
		<Stack direction="row" alignItems="flex-start" spacing={1}>
			<Card sx={{ aspectRatio: 4 / 5, width: 128 }}>
				{imageSrc ? (
					<CardMedia component="img" sx={{ objectFit: 'cover' }} height={'100%'} image={imageSrc} />
				) : (
					<MuiAvatar>
						<Folder />
					</MuiAvatar>
				)}
			</Card>
			<Stack gap={0.5} sx={{ flex: 1, justifyContent: 'space-between' }}>
				<Stack direction="row" gap={1}>
					<Typography variant="body1">{artifact.filename}</Typography>
					<Typography variant="body2">{formatFileSize(artifact.filesize)}</Typography>
				</Stack>
				<TextField
					label="Description"
					placeholder="Enter a description for this attachment"
					{...register(`artifacts.${index}.description`)}
					fullWidth
					multiline
					rows={2}
				/>
			</Stack>
			<IconButton onClick={() => onRemove()}>
				<Delete />
			</IconButton>
		</Stack>
	)
}

export default function JournalEntryForm() {
	const { setValue, control, watch } = useFormContext<CreateJournalEntryForm>()

	const [entryTagPickerData, setEntryTagPickerData] = useState<{ anchorEl: Element | null; index: number }>({
		anchorEl: null,
		index: 0,
	})

	const childrenFieldArray = useFieldArray<CreateJournalEntryForm>({
		control,
		name: 'children',
	})

	const artifactsFieldArray = useFieldArray<CreateJournalEntryForm>({
		control,
		name: 'artifacts',
	})

	const { getEntryTagsQuery } = useContext(JournalContext)

	const handleAddChild = () => {
		childrenFieldArray.append({
			amount: '',
			memo: '',
			entryType: 'CREDIT',
		})
	}

	const handleAddFiles = async (files: File[]) => {
		const artifacts: CreateEntryArtifact[] = files.map((file) => {
			const filename = file.name
			const artifact: CreateEntryArtifact = {
				_id: generateArtifactId(),
				_attachments: {
					[filename]: {
						content_type: file.type,
						data: file,
					},
				},
				description: '',
				filename,
				filesize: file.size,
			}

			return artifact
		})

		artifacts.forEach((artifact) => {
			artifactsFieldArray.append(artifact)
		})
	}

	const entryTagPickerSelectedTags = useMemo(() => {
		return watch(`children.${entryTagPickerData.index}.tagIds`) ?? []
	}, [entryTagPickerData.index, watch(`children.${entryTagPickerData.index}.tagIds`)])

	return (
		<>
			<EntryTagPicker
				anchorEl={entryTagPickerData.anchorEl}
				onClose={() => setEntryTagPickerData((prev) => ({ ...prev, anchorEl: null }))}
				value={entryTagPickerSelectedTags}
				onChange={(tagIds: EntryTag['_id'][]) => {
					setValue(`children.${entryTagPickerData.index}.tagIds`, tagIds)
				}}
			/>
			<Box sx={{ position: 'relative' }}>
				<Grid container columns={12} spacing={1} rowSpacing={1} mb={1}>
					<Grid size={8}>
						<Controller
							control={control}
							name="parent.memo"
							render={({ field }) => (
								<TextField
									label="Memo"
									variant='filled'
									autoFocus
									{...field}
									ref={null}
									value={field.value}
									onChange={(event) => {
										const value = event.target.value
										setValue(field.name, value)
										// if (!manuallySetCategory && enableAutoDetectCategory) {
										//     handleDetectCategoryWithAi(value);
										// }
									}}
									fullWidth
									multiline
									maxRows={3}
								/>
							)}
						/>
					</Grid>
					<Grid size={4}>
						<Controller
							control={control}
							name="parent.amount"
							render={({ field }) => (
								<TextField
									label="Amount"
									variant='filled'
									{...field}
									onChange={(event) => {
										const value = event.target.value
										const newValue = value
											.replace(/[^0-9.]/g, '') // Remove non-numeric characters except the dot
											.replace(/(\..*?)\..*/g, '$1') // Allow only one dot
											.replace(/(\.\d{2})\d+/g, '$1') // Limit to two decimal places
										field.onChange(newValue)
									}}
									fullWidth
									InputProps={{
										startAdornment: <InputAdornment position="start">$</InputAdornment>,
									}}
									sx={{ flex: 1 }}
									autoComplete="off"
								/>
							)}
						/>
					</Grid>
					<Grid size={6}>
						<Controller
							control={control}
							name="parent.date"
							render={({ field }) => (
								<LocalizationProvider dateAdapter={AdapterDayjs}>
									<DatePicker
										{...field}
										value={dayjs(field.value)}
										onChange={(value) => {
											setValue(field.name, value?.format('YYYY-MM-DD') ?? '')
										}}
										format="ddd, MMM D"
										label="Date"
										slotProps={{
											textField: {
												fullWidth: true,
												variant: 'filled'
											},
										}}
									/>
								</LocalizationProvider>
							)}
						/>
					</Grid>
					<Grid size={6}>
						<Controller
							control={control}
							name="parent.categoryIds"
							render={({ field }) => {
								const categoryIds = watch('parent.categoryIds')
								const categoryId: Category['_id'] | null = !categoryIds?.length ? null : categoryIds[0]

								return (
									<CategoryAutocomplete
										{...field}
										ref={null}
										variant='filled'
										value={categoryId}
										onChange={(_event, newValue) => {
											// setManuallySetCategory(Boolean(newValue))
											setValue(field.name, newValue ? [newValue] : [])
										}}
									/>
								)
							}}
						/>
					</Grid>
				</Grid>
				<Stack>
					{childrenFieldArray.fields.map((field, index) => {
						return (
							<JournalEntryChildRow
								key={field.id}
								index={index}
								fieldArray={childrenFieldArray.fields}
								remove={childrenFieldArray.remove}
								onClickTagButton={(event) => {
									setEntryTagPickerData({
										anchorEl: event.currentTarget,
										index,
									})
								}}
								entryTags={getEntryTagsQuery.data}
							/>
						)
					})}
				</Stack>
				<Button onClick={() => handleAddChild()}>Add Child</Button>
				<Stack>
					{artifactsFieldArray.fields.map((field, index) => {
						return (
							<AttachmentRow
								key={field.id}
								onRemove={() => artifactsFieldArray.remove(index)}
								index={index}
							/>
						)
					})}
				</Stack>
				<AttachmentDropzone onFilesAdded={handleAddFiles}>
					<AttachmentButton />
				</AttachmentDropzone>
			</Box>
		</>
	)
}
