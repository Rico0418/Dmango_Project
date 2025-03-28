import { Box, Typography, Link, Container } from "@mui/material";
import TypographyTemplate from "../molecules/Typography";

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: "#222",
                color: "white",
                textAlign: "center",
                padding: "20px 0",
                marginTop: "auto",
                width: "100%",
                bottom: "0",
                boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.2)",
            }}
        >
            <Container maxWidth="md">
                <TypographyTemplate variant="h6" fontWeight="bold">
                    Dmango Residence
                </TypographyTemplate>

                <Box sx={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
                    <Link href="/" sx={footerLinkStyles}>Home</Link>
                    <Link href="/contact" sx={footerLinkStyles}>Contact</Link>
                </Box>

                <Typography variant="body2" sx={{ marginTop: "8px", opacity: 0.8 }}>
                    © {new Date().getFullYear()} Dmango Residence. All rights reserved.
                </Typography>
            </Container>
        </Box>
    );
};

export default Footer;

const footerLinkStyles = {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    "&:hover": { color: "#007BFF" },
};
