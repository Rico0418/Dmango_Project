import { Box, Paper } from "@mui/material";
import LoginForm from "../components/organisms/LoginForm";
import TypographyTemplate from "../components/molecules/Typography";
const LoginPage = () => {
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
                    Dmango App Login Page
                </TypographyTemplate>
                <LoginForm />
            </Paper>
        </Box>
    );
};
export default LoginPage;