import { Box, Paper } from "@mui/material";
import RegisterForm from "../components/organisms/RegisterForm";
import TypographyTemplate from "../components/molecules/Typography";
const RegisterPage = () => {
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
            }}
        >
            <Paper elevation={3} sx={{ padding: 4, width: 400 }}>
                <TypographyTemplate variant="h5" align="center" gutterBottom>
                    Dmango App Register Page
                </TypographyTemplate>
                <RegisterForm />
            </Paper>
        </Box>
    );
};
export default RegisterPage;