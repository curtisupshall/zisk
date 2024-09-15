'use client';

import { createCategory, deleteCategory, updateCategory } from "@/actions/category-actions";
import CategoryForm from "@/components/form/CategoryForm";
import CategoryIcon from "@/components/icon/CategoryIcon";
import { DEFAULT_AVATAR } from "@/components/pickers/AvatarPicker";
import { NotificationsContext } from "@/contexts/NotificationsContext";
import { useCategoryStore } from "@/store/useCategoriesStore";
import { Category } from "@/types/get";
import { CreateCategory } from "@/types/post";
import { UpdateCategory } from "@/types/put";
import { zodResolver } from "@hookform/resolvers/zod";
import { Add, ArrowBack, ArrowRight, Close, Delete, NavigateNext, Save } from "@mui/icons-material";
import { Box, Button, Drawer, IconButton, List, ListItemIcon, ListItemSecondaryAction, ListItemText, MenuItem, Stack, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

enum ManageCategoriesFormState {
    VIEW = 'VIEW',
    EDIT = 'EDIT',
    CREATE = 'CREATE',
}

interface ManageCategoriesProps {
    onClose: () => void;
}

const categoryFormCreateValues: CreateCategory = {
    label: '',
    description: '',
    ...DEFAULT_AVATAR,
}

const formTitles: Record<ManageCategoriesFormState, string> = {
    [ManageCategoriesFormState.VIEW]: 'Categories',
    [ManageCategoriesFormState.EDIT]: 'Edit Category',
    [ManageCategoriesFormState.CREATE]: 'Create Category',
}

export default function ManageCategories(props: ManageCategoriesProps) {
    const [formState, setFormState] = useState<ManageCategoriesFormState>(ManageCategoriesFormState.VIEW);
    const categories = useCategoryStore((state) => state.categories);
    const addCategoryToStore = useCategoryStore((state) => state.addCategory);
    const updateCategoryInStore = useCategoryStore((state) => state.updateCategory);
    const deleteCategoryFromStore = useCategoryStore((state) => state.deleteCategory);
    const { snackbar } = useContext(NotificationsContext);

    const formTitle = formTitles[formState] ?? 'Categories';

    const createCategoryForm = useForm<CreateCategory>({
        defaultValues: categoryFormCreateValues,
        resolver: zodResolver(CreateCategory)
    });

    const updateCategoryForm = useForm<UpdateCategory>({
        defaultValues: categoryFormCreateValues,
        resolver: zodResolver(UpdateCategory)
    });

    console.log('create form state:', createCategoryForm.formState.errors);

    const handleSelectCategoryForEdit = (category: Category) => {
        updateCategoryForm.reset({ ...category });
        setFormState(ManageCategoriesFormState.EDIT);
    }

    const beginCreateCategory = () => {
        createCategoryForm.reset(categoryFormCreateValues);
        setFormState(ManageCategoriesFormState.CREATE)
    }

    const handleCreateCategory = async (formData: CreateCategory) => {
        try {
            await createCategory(formData);
            snackbar({ message: 'Created category' })
            setFormState(ManageCategoriesFormState.VIEW);
            addCategoryToStore(formData);
        } catch {
            snackbar({ message: 'Failed to create category' })
        }
    }

    const handleUpdateCategory = async (formData: UpdateCategory) => {
        await updateCategory(formData);
        snackbar({ message: 'Updated category' })
        setFormState(ManageCategoriesFormState.VIEW);
        updateCategoryInStore(formData);
    }

    const handleDeleteCategory = async () => {
        const category = updateCategoryForm.watch();
        await deleteCategory(category);
        snackbar({ message: 'Deleted category' })
        setFormState(ManageCategoriesFormState.VIEW);
        deleteCategoryFromStore(category);
    }

    const handleCancel = () => {
        if (formState === ManageCategoriesFormState.VIEW) {
            props.onClose();
        } else {
            setFormState(ManageCategoriesFormState.VIEW);
        }
    }

    return (
        <Stack>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
                <Stack direction='row' gap={1} alignItems='center'>
                    <IconButton onClick={() => handleCancel()}>
                        {formState === ManageCategoriesFormState.VIEW ? <Close /> : <ArrowBack />}
                    </IconButton>
                    <Typography variant='h6'>{formTitle}</Typography>
                </Stack>
                {formState === ManageCategoriesFormState.VIEW && (
                    <Button
                        startIcon={<Add />}
                        onClick={() => beginCreateCategory()}
                        variant='text'
                    >
                        Add Category
                    </Button>
                )}
                {formState === ManageCategoriesFormState.EDIT && (
                    <Button
                        startIcon={<Delete />}
                        onClick={() => handleDeleteCategory()}
                        variant='text'
                        color='error'
                    >
                        Delete
                    </Button>
                )}
            </Stack>
            {formState === ManageCategoriesFormState.VIEW && (
                <List dense>
                    {categories.map((category) =>  {
                        return (
                            <MenuItem onClick={() => handleSelectCategoryForEdit(category)} key={category.categoryId}>
                                <ListItemIcon>
                                    <CategoryIcon category={category} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={category.label}
                                />
                                <ListItemSecondaryAction>
                                    <NavigateNext />
                                </ListItemSecondaryAction>
                            </MenuItem>
                        )
                    })}
                </List>
            )}
            {formState === ManageCategoriesFormState.EDIT && (
                <FormProvider {...updateCategoryForm}>
                    <form onSubmit={updateCategoryForm.handleSubmit(handleUpdateCategory)}>
                        <Stack gap={2} pt={2}>
                            <CategoryForm />
                            <Button type='submit' variant='contained' startIcon={<Save />}>Save</Button>
                        </Stack>
                    </form>
                </FormProvider>
            )}
            {formState === ManageCategoriesFormState.CREATE && (
                <FormProvider {...createCategoryForm}>
                    <form onSubmit={createCategoryForm.handleSubmit(handleCreateCategory)}>
                        <Stack gap={2} pt={2}>
                            <CategoryForm />
                            <Button type='submit' variant='contained' startIcon={<Add />}>Create</Button>
                        </Stack>
                    </form>
                </FormProvider>
            )}
        </Stack>
    )
}
