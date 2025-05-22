import { Button, Container, Box, Link } from "@mui/material";
import TypographyTemplate from "../molecules/Typography";
import InputLabel from "../molecules/InputLabel";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
const RegisterForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name == "" || email == "" || password == "") {
            toast.error("Please Fill All Column");
            return;
        }
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/register`, { name,email, password });
            if (response.status == 201) {
                toast.success("Register successfull");
                navigate("/login");
            }
        } catch (error) {
            toast.error("Register failed! Please Try Again Later");
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
                <TypographyTemplate variant="h5">Register Form</TypographyTemplate>
                <InputLabel name="name" type="name" onChange={(e) => setName(e.target.value)} label="Name" value={name} />
                <InputLabel name="email" type="email" onChange={(e) => setEmail(e.target.value)} label="Email" value={email} />
                <InputLabel name="password" type="password" onChange={(e) => setPassword(e.target.value)} label="Password" value={password} />
                <Button type="submit" variant="contained" color="primary">
                    Register
                </Button>
            </Box>
            <Link
                component="button"
                variant="body1"
                onClick={() => {
                    navigate("/login");
                }}
            >
                Already have account? Login Here
            </Link>
        </Container>
    );
};
export default RegisterForm;