import Footer from "../../components/organisms/Footer";
import Navbar from "../../components/organisms/Navbar";
import UpdateRoomForm from "../../components/organisms/UpdateForm";

const UpdateRoomAdmin = () => {
    return (
        <div>
            <Navbar />
            <main style={{  minHeight: "90vh", flex:1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <UpdateRoomForm />
            </main>
            <Footer />
        </div>
    );
};
export default UpdateRoomAdmin;