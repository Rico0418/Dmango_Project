import { useEffect, useState } from "react";
import { Container, TextField, Button, Typography, Card, CardContent } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

const UserProfile = () => {
    const {id} = useParams();
    const [user, setUser] = useState({ name: "", email: "" });
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`http://localhost:8080/users/detail/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(response.data);
            } catch (error) {
                toast.error("Failed to fetch user details");
            }
        };
        fetchUser();
    }, []);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Please fill in both fields");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(
                "http://localhost:8080/users/password",
                { old_password: oldPassword, new_password: newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Password updated successfully");
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            toast.error(error.response?.data?.error || "Password update failed");
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>User Profile</Typography>
                    <TextField
                        label="Name"
                        value={user.name}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                    <TextField
                        label="Email"
                        value={user.email}
                        fullWidth
                        margin="normal"
                        InputProps={{ readOnly: true }}
                    />
                    
                    <Typography variant="h6" sx={{ mt: 2 }}>Change Password</Typography>
                    <TextField
                        label="Old Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={handleChangePassword}
                    >
                        Update Password
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};

export default UserProfile;
