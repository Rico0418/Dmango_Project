import { AppBar, Toolbar, Button, Tabs, Tab, Box } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import TypographyTemplate from "../molecules/Typography";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AppBar position="static" sx={{ width: "100%", top: 0 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <TypographyTemplate variant="h5" sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
                    Dmango Residence
                </TypographyTemplate>

                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                    <Tabs
                        value={location.pathname}
                        textColor="inherit"
                        indicatorColor="secondary"
                    >
                        <Tab label="Home" value="/" onClick={() => navigate("/")} />
                        {user?.role === "admin" && (
                            <Tab label="Manage Users" value="/admin/manage-users" onClick={() => navigate("/admin/manage-users")} />
                        )}
                        {user?.role === "admin" && (
                            <Tab label="Manage Rooms" value="/admin/manage-rooms" onClick={() => navigate("/admin/manage-rooms")} />
                        )}
                        {user?.role === "customer" && (
                            <Tab label="Bookings" value="/customer/bookings" onClick={() => navigate("/customer/bookings")} />
                        )}
                        {user?.role === "customer" && (
                            <Tab label="Rooms" value="/customer/rooms" onClick={() => navigate("/customer/rooms")} />
                        )}
                    </Tabs>
                </Box>

                {user && (
                    <Button variant="contained" color="error" onClick={handleLogout}>
                        Logout
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
