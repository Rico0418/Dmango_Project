import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@mui/material";
const HomePage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Get token from localStorage
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    // Logout function
    const handleLogout = () => {
        logout(); // Clears user state in context
        localStorage.removeItem("token"); // Clears token from localStorage
        navigate("/login"); // Redirect to login page
    };

    return (
        <div>
            <h1>Ini HomePage</h1>
            <p>Token: {token}</p>
            <Button variant="contained" color="primary" onClick={handleLogout}>
                Logout
            </Button>
        </div>
    );
};
export default HomePage;