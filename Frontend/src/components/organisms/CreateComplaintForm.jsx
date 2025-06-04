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
} from "@mui/material";
import { toast } from "react-toastify";


const CreateComplaintDialog = ({ open, onClose, roomId, onComplaintCreated }) => {
    const { user } = useAuth();
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        try {
            const payload = {
                room_id: roomId,
                user_id: user.id,
                description,
            };
            const token = sessionStorage.getItem("token")
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/complaints`, payload,{headers: {
                Authorization: `Bearer ${token}`
            }});
            toast.success("Complaint created successfully");
            setDescription("");
            if (onComplaintCreated) {
            onComplaintCreated();
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("failed to create complaint")
        }
    };

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

        </>
    );
};
export default CreateComplaintDialog