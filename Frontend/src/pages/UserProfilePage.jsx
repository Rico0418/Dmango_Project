import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import UserProfile from "../components/organisms/UserProfile";

const UserProfilePage = () => {
    return (
        <>
            <Navbar />
                <main style={{ minHeight: "90vh", display: "flex", alignItems: "center" }}>
                    <UserProfile />
                </main>
            <Footer />
        </>
    );
};
export default UserProfilePage;