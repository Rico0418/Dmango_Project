import { Container, Card, CardContent, Typography, Box } from "@mui/material";
import { Phone, Email, LocationOn } from "@mui/icons-material";
import TypographyTemplate from "../molecules/Typography";

const Contact = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4}}>
            <Card sx={{ borderRadius: 3, boxShadow: 5, backgroundColor: "#f9f9f9" }}>
                <CardContent>
                    <Typography variant="h4" fontWeight="bold" align="center" color="primary" gutterBottom>
                        Contact Us
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <LocationOn color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            <strong>Location D'mango Residence 1:</strong> Jl. Maluku II No.3, Karangtempel, Kec. Semarang Tim., Kota Semarang, Jawa Tengah 50232
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <LocationOn color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            <strong>Location D'mango Residence 2:</strong> Jl. Taman Maluku No.48, Karangtempel, Kec. Semarang Tim., Kota Semarang, Jawa Tengah 50125
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Phone color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            <strong>Owner Phone:</strong> +62 878-3252-7672
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Phone color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            <strong>Care Taker Phone:</strong> +62 812-3456-7890
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Email color="secondary" sx={{ mr: 1 }} />
                        <Typography variant="body1">
                            <strong>Email:</strong> support@dmango.com
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Contact;
