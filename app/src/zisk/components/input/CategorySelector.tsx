import { useContext, useRef, useState } from "react";
import CategoryAutocomplete, { CategoryAutocompleteProps } from "./CategoryAutocomplete";
import { 
    AutocompleteCloseReason,
    Button,
    ButtonBase,
    ClickAwayListener,
    Divider,
    IconButton,
    InputBase,
    Link,
    ListItem,
    Paper,
    Popper,
    Stack,
    Typography
} from "@mui/material";
import { Close, Done, Settings } from "@mui/icons-material";
import AvatarChip from "../icon/AvatarChip";
import { JournalContext } from "@/contexts/JournalContext";
import AvatarIcon from "../icon/AvatarIcon";
import { createCategory } from "@/database/actions";
import clsx from "clsx";
import { generateRandomAvatar } from "@/utils/journal";
import { Category } from "@/schema/documents/Category";

type CategorySelectorProps = Omit<CategoryAutocompleteProps, 'renderInput'>

export default function CategorySelector(props: CategorySelectorProps) {
    const anchorRef = useRef<HTMLAnchorElement>(null);
    const [open, setOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('')
    const { getCategoriesQuery, journal } = useContext(JournalContext)
    const value: string | undefined = !Array.isArray(props.value) && props.value || undefined

    const selectedCategory: Category | undefined = value ? getCategoriesQuery.data[value] : undefined

    const handleClose = () => {
        setOpen(false)
    }

    const createCategoryWithValue = async () => {
        if (!journal) {
            return
        }
        const journalId = journal._id
        await createCategory({
            label: searchValue,
            description: '',
            avatar: generateRandomAvatar(),
        }, journalId)
        getCategoriesQuery.refetch()
    }

    return (
        <Stack gap={0.5}>
            <Button
                component='a'
                className={clsx({ '--open': open })}
                ref={anchorRef}
                onClick={() => setOpen(true)}
                sx={(theme) => ({
                    mx: -1,
                    mt: -2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    textAlign: 'left',
                    color: 'inherit',
                    '&:hover, &:focus, &:focus-within, &.--open': {
                        color: theme.palette.primary.main
                    },
                    background: 'none',
                })}
                disableRipple
                tabIndex={-1}
            >
                <Typography component='span' variant='body2' sx={{ fontWeight: 500 }}>Category</Typography>
                <IconButton sx={{ m: -1, color: 'inherit' }} disableTouchRipple>
                    <Settings />
                </IconButton>
            </Button>
            {!selectedCategory ? (
                <Typography sx={{ mt: -1 }} variant='body2' color='textSecondary'>
                    <span>No category — </span>
                    <Link onClick={() => setOpen(true)}>Add one</Link>
                </Typography>
            ) : (
                <Stack direction='row' alignItems='flex-start' gap={1} sx={{ flexWrap: 'wrap', mx: -0.5 }}>
                    <ButtonBase disableRipple onClick={() => setOpen(true)} key={selectedCategory._id}>
                        <AvatarChip icon contrast avatar={selectedCategory.avatar} label={selectedCategory.label} />
                    </ButtonBase>
                </Stack>
            )}
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                sx={(theme) => ({ width: '300px', zIndex: theme.zIndex.modal})}
                placement='bottom-start'
            >
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper>
                        <CategoryAutocomplete
                            {...props}
                            open
                            onClose={(
                                _event,
                                reason: AutocompleteCloseReason,
                            ) => {
                                if (reason === 'escape') {
                                    handleClose();
                                }
                            }}
                            disableCloseOnSelect
                            noOptionsText={
                                searchValue.length === 0 ? (
                                    <Typography variant='body2' color='textSecondary'>
                                        No categories
                                    </Typography>
                                ) : (
                                    <Link onClick={() => createCategoryWithValue()}>
                                        Create new category &quot;{searchValue}&quot;
                                    </Link>
                                )
                            }
                            renderTags={() => null}
                            renderInput={(params) => (
                                <>
                                    <InputBase
                                        sx={{ width: '100%', px: 2, py: 1 }}
                                        ref={params.InputProps.ref}
                                        value={searchValue}
                                        onChange={(event) => setSearchValue(event.target.value)}
                                        inputProps={params.inputProps}
                                        autoFocus
                                        placeholder="Filter categories"
                                    />
                                    <Divider />
                                </>
                            )}
                            renderOption={(props, option, { selected }) => {
                                const { key, ...optionProps } = props
                                const category = getCategoriesQuery.data[option]

                                return (
                                    <ListItem key={key} {...optionProps}>
                                        <Done
                                            sx={(theme) => ({
                                                width: 17,
                                                height: 17,
                                                mr: theme.spacing(1),
                                                visibility: selected ? 'visible' : 'hidden',
                                            })}
                                        />
                                        <Stack direction='row' sx={{ flexGrow: 1, gap: 1 }}>
                                            <AvatarIcon avatar={category.avatar} />
                                            {category.label}
                                        </Stack>
                                        <Close
                                            sx={{
                                                opacity: 0.6,
                                                width: 18,
                                                height: 18,
                                                visibility: selected ? 'visible' : 'hidden',
                                            }}
                                        />
                                    </ListItem>
                                );
                            }}
                            slots={{
                                popper: (params: any) => <div {...params} />,
                                paper: (params) => <div {...params} />,
                            }}
                        />
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Stack>
    )
}
