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
        sessionStorage.removeItem("token");
        navigate("/login");
    };

    const navItems = [
        { label: "Home", path: "/" },
        ...(user?.role === "admin" ? [
            { label: "Manage Complaints", path: "/admin/manage-complaints" },
            { label: "Manage Rooms", path: "/admin/manage-rooms" },
            { label: "Manage Bookings", path: "/admin/manage-bookings" },
            { label: "Manage Payments", path: "/admin/manage-payments" },
            { label: "Manage Suggestion", path: "/admin/manage-suggestion"},
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
            sx={{
                "& .MuiTab-root": {
                    fontWeight: 500,
                    fontSize: "15px",
                    textTransform: "none"
                }
            }}
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
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ outline: "none" }}>
            <Box sx={{
                width: 250,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                height: "100%"
            }} role="presentation" onClick={() => setDrawerOpen(false)}>
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
        <AppBar
            position="sticky"
            elevation={4}
            sx={{
                background: "#27548A",
                px: 2,
                py: 1,
                borderRadius: "0 0 0px 0px",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box display="flex" alignItems="center">
                    <TypographyTemplate
                        variant="h6"
                        sx={{ cursor: "pointer", fontWeight: "bold", color: "#fff" }}
                        onClick={() => navigate("/")}
                    >
                        D'mango Residence
                    </TypographyTemplate>
                </Box>

                {isMobile ? (
                    <>
                        <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{
                            "&:focus": { outline: "none" },
                            "&:focus-visible": { outline: "none" },
                            "&:active": { outline: "none" }
                        }}>
                            <MenuIcon />
                        </IconButton>
                        {renderMobileMenu()}
                    </>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {renderTabs()}
                        {user && (
                            <>
                                <IconButton color="inherit" onClick={() => navigate(`/user/profile/${user.id}`)} sx={{
                                    "&:focus": { outline: "none" },
                                    "&:focus-visible": { outline: "none" },
                                    "&:active": { outline: "none" }
                                }}>
                                    <AccountCircle sx={{ fontSize: 32 }} />
                                </IconButton>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={handleLogout}
                                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: "bold", "&:focus": { outline: "none" },
                                    "&:focus-visible": { outline: "none" },
                                    "&:active": { outline: "none" } }}
                                >
                                    Logout
                                </Button>
                            </>
                        )}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
