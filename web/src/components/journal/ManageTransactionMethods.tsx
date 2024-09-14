import { TransactionMethodContext } from "@/contexts/TransactionMethodContext";
import { Add } from "@mui/icons-material";
import { Box, Button, DialogTitle, Divider, Icon, ListItemIcon, ListItemText, MenuItem, MenuList } from "@mui/material";
import { useContext, useState } from "react";

export default function ManageTransactionMethods() {
    const { transactionMethods } = useContext(TransactionMethodContext);
    const [showTransactionMethodModal, setShowTransactionMethodModal] = useState<boolean>(false);

    return (
        <>
            {/* <CreateTransactionMethodModal
                open={showTransactionMethodModal}
                onClose={() => setShowTransactionMethodModal(false)}
            /> */}
            <Box>
                <MenuList>
                    {transactionMethods.map((transactionMethod) => (
                        <MenuItem key={transactionMethod.transactionMethodId}>
                            <ListItemIcon>
                                <Icon
                                    sx={{ color: transactionMethod.avatarPrimaryColor }}
                                >
                                    {transactionMethod.avatarContent}
                                </Icon>
                            </ListItemIcon>
                            <ListItemText primary={transactionMethod.label} />
                        </MenuItem>
                    ))}
                </MenuList>
                {/* <Divider sx={{ my: 1 }} /> */}
                <Box px={2}>
                    <Button
                        onClick={() => setShowTransactionMethodModal(true)}
                        startIcon={<Add />}
                        fullWidth
                    >Add</Button>
                </Box>
            </Box>
        </>
    )
}
