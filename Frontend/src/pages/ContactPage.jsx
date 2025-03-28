import Contact from "../components/organisms/Contact";
import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";

const ContactPage = () => {
    return(
        <>
            <Navbar />
                <main style={{ minHeight: "90vh", display: "flex", alignItems: "center" }}>
                    <Contact />
                </main>
            <Footer />
        </>
    );
};
export default ContactPage; 