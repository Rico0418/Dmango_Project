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
                background: "linear-gradient(to right, #667eea, #764ba2)",
            }}
        >
            <Paper elevation={6}
                sx={{
                    padding: 5,
                    width: 420,
                    borderRadius: 3,
                    backgroundColor: "#fff",
                }}>
                <TypographyTemplate variant="h4" align="center" gutterBottom sx={{ fontWeight:600 }}>
                    Welcome to D'mango
                </TypographyTemplate>
                <TypographyTemplate variant="body" align="center" gutterBottom color="text.secondary">
                    Login to continue
                </TypographyTemplate>
                <LoginForm />
            </Paper>
        </Box>
    );
};
export default LoginPage;