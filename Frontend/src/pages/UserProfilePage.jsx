import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import UserProfile from "../components/organisms/UserProfile";

const UserProfilePage = () => {
    return (
        <>
            <Navbar />
                <main style={{ minHeight: "100%", display: "flex", alignItems: "center",flex: 1 }}>
                    <UserProfile />
                </main>
            <Footer />
        </>
    );
};
export default UserProfilePage;