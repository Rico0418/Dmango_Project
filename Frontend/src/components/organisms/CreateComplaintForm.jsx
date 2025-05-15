import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";


const CreateComplaintDialog = ({ open, onClose, roomId, onComplaintCreated }) => {
    const { user } = useAuth();
    const [description, setDescription] = useState("");
    const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

    const handleSubmit = async () => {
        try {
            const payload = {
                room_id: roomId,
                user_id: user.id,
                description,
            };
            const token = localStorage.getItem("token")
            const res = await axios.post("http://localhost:8080/complaints", payload,{headers: {
                Authorization: `Bearer ${token}`
            }});
            setAlert({ open: true, type: "success", message: "Complaint created successfully." });
            setDescription("");
            if (onComplaintCreated) {
            onComplaintCreated();
            }
            onClose();
        } catch (err) {
            console.error(err);
            setAlert({
                open: true,
                type: "error",
                message: "Failed to create complaint",
            });
        }
    };
    const handleCloseAlert = () => setAlert({ ...alert, open: false });
    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth>
                <DialogTitle>Create Complaint</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!description.trim()}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={alert.open} autoHideDuration={4000} onClose={handleCloseAlert}>
                <Alert severity={alert.type} onClose={handleCloseAlert} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </>
    );
};
export default CreateComplaintDialog