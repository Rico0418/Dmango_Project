import { Button, Container, Box, Link } from "@mui/material";
import TypographyTemplate from "../molecules/Typography";
import InputLabel from "../molecules/InputLabel";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email == "" || password == "") {
            toast.error("Please Fill Both Column");
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, { name, email, password });
            const token = response.data.token;
            if (token) {
                login(token);
                toast.success("Login successfull");
                navigate("/");
            }
        } catch (error) {
            toast.error("Login failed! Email or Password Not Match");
        }
    };
    return (
        <Container maxWidth="xs">
            <Box component="form" onSubmit={handleSubmit} sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 4,
                p: 3,
                boxShadow: 2,
                borderRadius: 2,
            }}>
                <TypographyTemplate variant="h5">Login Form</TypographyTemplate>
                <InputLabel name="email" type="email" onChange={(e) => setEmail(e.target.value)} label="Email" value={email} />
                <InputLabel name="password" type="password" onChange={(e) => setPassword(e.target.value)} label="Password" value={password} />
                <Button type="submit" variant="contained" color="primary" sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: "bold",
                    py: 1.5,
                    fontSize: "1rem",
                    "&:hover": {
                        backgroundColor: "#3b82f6",
                    },
                    "&:focus": { outline: "none" },
                    "&:focus-visible": { outline: "none" },
                    "&:active": { outline: "none" }
                }}>
                    Login
                </Button>
            </Box>
            <Link
                component="button"
                variant="body2"
                onClick={() => {
                    navigate("/register");
                }}
                sx={{
                    mt: 1,
                    textAlign: "center",
                    textDecoration: "none",
                    color: "primary.main",
                    "&:hover": {
                        textDecoration: "underline",
                    },
                }}
            >
                Don't have account yet? Register Here
            </Link>
        </Container>
    );
};
export default LoginForm;