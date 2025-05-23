import { AppBar, Toolbar, Button, Tabs, Tab, Box, IconButton } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import TypographyTemplate from "../molecules/Typography";
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        logout();
        localStorage.removeItem("token");
        navigate("/login");
    };

    const navItems = [
        { label: "Home", path: "/" },
        ...(user?.role === "admin" ? [
            { label: "Manage Complaints", path: "/admin/manage-complaints" },
            { label: "Manage Rooms", path: "/admin/manage-rooms" },
            { label: "Manage Bookings", path: "/admin/manage-bookings" },
            { label: "Manage Payments", path: "/admin/manage-payments" }
        ] : []),
        ...(user?.role === "customer" ? [
            { label: "Rooms", path: "/customer/rooms" },
            { label: "History", path: "/customer/bookings" },
            { label: "Current Room", path: "/customer/complaints" }
        ] : [])
    ];

    const renderTabs = () => (
        <Tabs
            value={location.pathname}
            textColor="inherit"
            sx={{ "& .MuiTabs-indicator": { backgroundColor: "white" } }}
        >
            {navItems.map(item => (
                <Tab
                    key={item.path}
                    label={item.label}
                    value={item.path}
                    onClick={() => navigate(item.path)}
                    sx={{ "&:focus": { outline: "none" } }}
                />
            ))}
        </Tabs>
    );

    const renderMobileMenu = () => (
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{  outline: "none" }}>
            <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                <List>
                    {navItems.map(item => (
                        <ListItem button key={item.path} onClick={() => navigate(item.path)}>
                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))}
                    <ListItem button onClick={() => navigate(`/user/profile/${user.id}`)}>
                        <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button onClick={handleLogout}>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );

    return (
        <AppBar position="static" sx={{ width: "100%", top: 0 }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <TypographyTemplate
                    variant="h5"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    Dmango Residence
                </TypographyTemplate>

                {isMobile ? (
                    <>
                        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                        {renderMobileMenu()}
                    </>
                ) : (
                    <>
                        <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                            {renderTabs()}
                        </Box>
                        {user && (
                            <>
                                <IconButton sx={{ color: "inherit", mr: 1 }} onClick={() => navigate(`/user/profile/${user.id}`)}>
                                    <AccountCircle sx={{ fontSize: 40 }} />
                                </IconButton>
                                <Button variant="contained" color="error" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
