'use client'

import {
	Box,
	Button,
	Grid2 as Grid,
	Stack,
	TextField,
	Typography,
} from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { JournalEntry } from '@/types/schema'
import { Add, SubdirectoryArrowRight } from '@mui/icons-material'
// import { JournalContext } from '@/contexts/JournalContext'
import AmountField from '../input/AmountField'
import CategorySelector from '../input/CategorySelector'

// interface JournalEntryChildRowProps {
// 	index: number
// 	fieldArray: UseFieldArrayReturn<CreateJournalEntryForm>['fields']
// 	entryTags: Record<string, EntryTag>
// 	remove: UseFieldArrayReturn<CreateJournalEntryForm>['remove']
// 	onClickTagButton: (event: React.MouseEvent<HTMLButtonElement>) => void
// }

// const JournalEntryChildRow = (props: JournalEntryChildRowProps) => {
// 	const { setValue, control, watch, register } = useFormContext<CreateJournalEntryForm>()

// 	const childTagIds = watch(`children.${props.index}.tagIds`) ?? []
// 	const childTags = childTagIds.map((tagId) => props.entryTags[tagId]).filter(Boolean)
// 	const hasTags = childTagIds.length > 0
// 	const categoryIds = (watch(`children.${props.index}.categoryIds`) as string[] | undefined) ?? []
// 	const categoryId: string | undefined = categoryIds.length > 0 ? categoryIds[0] : undefined

// 	return (
// 		<Grid container columns={12} spacing={1} rowSpacing={0} sx={{ alignItems: 'center' }}>
// 			<Grid size={'grow'}>
// 				<Controller
// 					control={control}
// 					name={`children.${props.index}.amount` as const}
// 					render={({ field }) => (
// 						<AmountField
// 							{...field}
// 							fullWidth
// 							sx={{ flex: 1 }}
// 							autoComplete="off"
// 							size='small'
// 						/>
// 					)}
// 				/>
// 			</Grid>
// 			<Grid size={4}>
// 				<Controller
// 					control={control}
// 					name={`children.${props.index}.categoryIds` as const}
// 					render={({ field }) => (
// 						<CategoryAutocomplete
// 							{...field}
// 							ref={null}
// 							value={categoryId}
// 							onChange={(_event, newValue) => {
// 								setValue(field.name, newValue ? [newValue] : [])
// 							}}
// 							label="Category"
// 							size="small"
// 						/>
// 					)}
// 				/>
// 			</Grid>
// 			<Grid size={4}>
// 				<TextField label="Memo" {...register(`children.${props.index}.memo`)} fullWidth size="small" />
// 			</Grid>
// 			<Grid size="auto">
// 				<Stack direction="row">
// 					<IconButton onClick={props.onClickTagButton}>
// 						<Label />
// 					</IconButton>
// 					<IconButton onClick={() => props.remove(props.index)}>
// 						<Delete />
// 					</IconButton>
// 				</Stack>
// 			</Grid>
// 			<Grid size={12}>
// 				<Collapse in={hasTags}>
// 					<Stack gap={1} sx={{ pt: 1.25, pb: 0.75, flexFlow: 'row wrap' }}>
// 						{childTags.map((entryTag: EntryTag) => {
// 							return <Chip size="small" key={entryTag._id} label={entryTag.label} />
// 						})}
// 					</Stack>
// 				</Collapse>
// 			</Grid>
// 		</Grid>
// 	)
// }

// interface AttachmentRowProps {
// 	onRemove: () => void
// 	index: number
// }

// const AttachmentRow = (props: AttachmentRowProps) => {
// 	const { index, onRemove } = props
// 	const { watch, register } = useFormContext<CreateJournalEntryForm>()

// 	const artifact = watch(`artifacts.${index}`)

// 	// Check if the artifact's file has an content type of image. If so, we create a URL for it
// 	const imageSrc: string | null = useMemo(() => {
// 		const attachment = artifact._attachments[artifact.filename]
// 		if (attachment.content_type.startsWith('image')) {
// 			const blob = new Blob([attachment.data], { type: attachment.content_type })
// 			return URL.createObjectURL(blob)
// 		}

// 		return null
// 	}, [artifact])

// 	return (
// 		<Stack direction="row" alignItems="flex-start" spacing={1}>
// 			<Card sx={{ aspectRatio: 4 / 5, width: 128 }}>
// 				{imageSrc ? (
// 					<CardMedia component="img" sx={{ objectFit: 'cover' }} height={'100%'} image={imageSrc} />
// 				) : (
// 					<MuiAvatar>
// 						<Folder />
// 					</MuiAvatar>
// 				)}
// 			</Card>
// 			<Stack gap={0.5} sx={{ flex: 1, justifyContent: 'space-between' }}>
// 				<Stack direction="row" gap={1}>
// 					<Typography variant="body1">{artifact.filename}</Typography>
// 					<Typography variant="body2">{formatFileSize(artifact.filesize)}</Typography>
// 				</Stack>
// 				<TextField
// 					label="Description"
// 					placeholder="Enter a description for this attachment"
// 					{...register(`artifacts.${index}.description`)}
// 					fullWidth
// 					multiline
// 					rows={2}
// 				/>
// 			</Stack>
// 			<IconButton onClick={() => onRemove()}>
// 				<Delete />
// 			</IconButton>
// 		</Stack>
// 	)
// }

export default function JournalEntryForm() {
	const { setValue, control, watch, register } = useFormContext<JournalEntry>()

	// const [entryTagPickerData, setEntryTagPickerData] = useState<{ anchorEl: Element | null; index: number }>({
	// 	anchorEl: null,
	// 	index: 0,
	// })

	// const artifactsFieldArray = useFieldArray<CreateJournalEntryForm>({
	// 	control,
	// 	name: 'artifacts',
	// })

	// const { getEntryTagsQuery } = useContext(JournalContext)

	// const handleAddChild = () => {
	// 	childrenFieldArray.append({
	// 		amount: '',
	// 		memo: '',
	// 	})
	// }

	// const handleAddFiles = async (files: File[]) => {
	// 	const artifacts: CreateEntryArtifact[] = files.map((file) => {
	// 		const filename = file.name
	// 		const artifact: CreateEntryArtifact = {
	// 			_id: generateArtifactId(),
	// 			_attachments: {
	// 				[filename]: {
	// 					content_type: file.type,
	// 					data: file,
	// 				},
	// 			},
	// 			description: '',
	// 			filename,
	// 			filesize: file.size,
	// 		}

	// 		return artifact
	// 	})

	// 	artifacts.forEach((artifact) => {
	// 		artifactsFieldArray.append(artifact)
	// 	})
	// }

	// const entryTagPickerSelectedTags = useMemo(() => {
	// 	return watch(`children.${entryTagPickerData.index}.tagIds`) ?? []
	// }, [entryTagPickerData.index, watch(`children.${entryTagPickerData.index}.tagIds`)])

	const handleAddSubEntry = () => {
		throw new Error('Not implemented')
	}

	return (
		<>
			{/* <EntryTagPicker
				anchorEl={entryTagPickerData.anchorEl}
				onClose={() => setEntryTagPickerData((prev) => ({ ...prev, anchorEl: null }))}
				value={entryTagPickerSelectedTags}
				onChange={(tagIds: EntryTag['_id'][]) => {
					setValue(`children.${entryTagPickerData.index}.tagIds`, tagIds)
				}}
			/> */}
			<Box sx={{ position: 'relative' /* Used for attachment drag overlay */ }}>
				<Grid container columns={12} spacing={3} rowSpacing={2} mb={1} sx={{ px: 0 }}>
					<Grid size={12}>
						<Stack direction='row' sx={{ pt: 0, pb: 2 }}>
							<Button variant='outlined' startIcon={<SubdirectoryArrowRight />} onClick={() => handleAddSubEntry()}>
								Add Sub-Entry
							</Button>
						</Stack>
					</Grid>
					<Grid size={8}>
						<Grid container columns={12} spacing={2} rowSpacing={2} mb={1}>
							<Grid size={12}>
								<TextField
									label="Memo"
									variant='filled'
									autoFocus
									// ref={null}
									{...register('memo')}
									fullWidth
									multiline
									maxRows={3}
								/>
							</Grid>
							<Grid size={8}>
								<Controller
									control={control}
									name="amount"
									render={({ field }) => (
										<AmountField
											variant='filled'
											{...field}
											fullWidth
											sx={{ flex: 1 }}
											autoComplete="off"
										/>
									)}
								/>
							</Grid>
							<Grid size={4}>
								<Controller
									control={control}
									name="date"
									render={({ field }) => (
										<LocalizationProvider dateAdapter={AdapterDayjs}>
											<DatePicker
												{...field}
												value={dayjs(field.value)}
												onChange={(value) => {
													setValue(field.name, value?.format('YYYY-MM-DD') ?? '', { shouldDirty: true })
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
						</Grid>
						{/* <Stack>
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
						</Stack> */}
						<Stack direction='row' alignItems={'center'} justifyContent={'space-between'} mt={2}>
							<Typography>Sub-Entries (0)</Typography>
							<Button onClick={() => handleAddSubEntry()} startIcon={<Add />}>Add Row</Button>
						</Stack>
						{/* <Stack>
							{artifactsFieldArray.fields.map((field, index) => {
								return (
									<AttachmentRow
										key={field.id}
										onRemove={() => artifactsFieldArray.remove(index)}
										index={index}
									/>
								)
							})}
						</Stack> */}
					</Grid>
					<Grid size={4}>
						<Stack>
							<Controller
								control={control}
								name="categoryIds"
								render={({ field }) => {
									const categoryIds = watch('categoryIds') ?? []
									// const categoryId: Category['_id'] | null = !categoryIds?.length ? null : categoryIds[0]

									return (
										<CategorySelector
											{...field}
											// ref={null}
											// variant='filled'
											value={categoryIds}
											onChange={(_event, newValue) => {
												// setManuallySetCategory(Boolean(newValue))
												setValue(field.name, newValue ?? [], { shouldDirty: true })
											}}
										/>
									)
								}}
							/>
						</Stack>
					</Grid>
				{/* <AttachmentDropzone onFilesAdded={handleAddFiles}>
					<AttachmentButton />
				</AttachmentDropzone> */}
				</Grid>
			</Box>
		</>
	)
}
