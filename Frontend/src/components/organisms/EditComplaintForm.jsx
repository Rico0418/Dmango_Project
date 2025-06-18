import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";

const EditComplaintForm = ({open, onClose, complaint, onSubmit}) => {
    const [description, setDescription] = useState("");
    useEffect(()=> {
        if(complaint){
            setDescription(complaint.description);
        }
    },[complaint]);
    const handleSave = () => {
        onSubmit(complaint.id, description);
    };
    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Edit Complaint</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} sx={{ "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary" sx={{ "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default EditComplaintForm;