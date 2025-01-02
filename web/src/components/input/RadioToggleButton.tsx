import { Box, Radio, ToggleButton, ToggleButtonProps, Typography } from "@mui/material";

interface IRadioToggleButtonProps extends ToggleButtonProps {
    heading: string;
    description: string;
}

const RadioToggleButton = (props: IRadioToggleButtonProps) => {
    const { children, heading, description, sx, ...rest } = props;

    return (
        <ToggleButton {...rest} sx={{ flexDirection: 'column', alignItems: 'normal', ...sx }}>
            <Box display='flex' flexDirection='row' alignItems='flex-start' flex={1}>
                <Box textAlign='left' flex={1}>
                    <Typography variant='body1'><strong>{heading}</strong></Typography>
                    <Typography variant='body2'>{description}</Typography>
                </Box>
                <Radio sx={{ mt: -1, mr: -1 }} checked={props.selected} disabled={props.disabled} />
            </Box>
            {props.children}
        </ToggleButton>
    )
}

export default RadioToggleButton;
