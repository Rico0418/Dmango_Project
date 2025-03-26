import { Box, Container, Typography } from "@mui/material";
import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import building from "../assets/building.jpg"
const HomePage = () => {

    return (
        <div>
            <Navbar />
            <main style={{ padding: '30px' }}>
                <Container maxWidth="md">
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            minHeight: "70vh",
                        }}
                    >
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            Welcome to Dmango Residence
                        </Typography>

                        <Typography variant="body1" sx={{ maxWidth: "600px", marginBottom: "20px" }}>
                            Dmango Residence is a premium accommodation service offering comfortable,
                            affordable, and modern living spaces. Whether you're looking for short-term
                            stays or long-term rentals, we provide a seamless booking experience.
                        </Typography>

                        <Box
                            component="img"
                            src={building}
                            alt="Dmango Residence"
                            sx={{ width: "100%", maxWidth: "500px", borderRadius: "10px", boxShadow: 2 }}
                        />
                    </Box>
                </Container>
            </main>
            <Footer />
        </div>
    );
};
export default HomePage;