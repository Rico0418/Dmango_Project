import { AppBar, Toolbar, Button, Tabs, Tab, Box, IconButton } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import TypographyTemplate from "../molecules/Typography";
import AccountCircle from '@mui/icons-material/AccountCircle';

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
                        sx={{ "& .MuiTabs-indicator": { backgroundColor: "white" } }}
                    >
                        <Tab label="Home" value="/" onClick={() => navigate("/")} sx={{ "&:focus": { outline: "none" } }} />
                        {user?.role === "admin" && (
                            <Tab label="Manage Complaints" value="/admin/manage-complaints" onClick={() => navigate("/admin/manage-complaints")} sx={{ "&:focus": { outline: "none" } }} />
                        )}
                        {user?.role === "admin" && (
                            <Tab label="Manage Rooms" value="/admin/manage-rooms" onClick={() => navigate("/admin/manage-rooms")} sx={{ "&:focus": { outline: "none" } }}/>
                        )}
                        {user?.role === "admin" && (
                            <Tab label="Manage Bookings" value="/admin/manage-bookings" onClick={() => navigate("/admin/manage-bookings")} sx={{ "&:focus": { outline: "none" } }}/>
                        )}
                        {user?.role === "customer" && (
                            <Tab label="Bookings" value="/customer/bookings" onClick={() => navigate("/customer/bookings")}sx={{ "&:focus": { outline: "none" } }}/>
                        )}
                        {user?.role === "customer" && (
                            <Tab label="Rooms" value="/customer/rooms" onClick={() => navigate("/customer/rooms")} sx={{ "&:focus": { outline: "none" } }}/>
                        )}
                    </Tabs>
                </Box>

                {user && (
                    <>
                        <IconButton sx={{ color:"inherit", mr:1 }} onClick={()=>navigate(`/user/profile/${user.id}`)}>
                            <AccountCircle sx={{ fontSize:40 }}/>
                        </IconButton>
                        <Button variant="contained" color="error" onClick={handleLogout}>
                            Logout
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
