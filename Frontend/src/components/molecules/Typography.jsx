import { Typography } from "@mui/material";
const TypographyTemplate = ({variant, children}) => {
    return(
        <Typography variant={variant}>{children}</Typography>
    );
};
export default TypographyTemplate;