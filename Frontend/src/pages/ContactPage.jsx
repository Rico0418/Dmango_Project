import React, { useState } from "react";
import Contact from "../components/organisms/Contact";
import Footer from "../components/organisms/Footer";
import Navbar from "../components/organisms/Navbar";
import { toast } from "react-toastify";
import {
    Button,
    TextField,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import axios from "axios";

const ContactPage = () => {
    const [openSuggestionDialog, setOpenSuggestionDialog] = useState(false);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const handleOpen = () => setOpenSuggestionDialog(true);
    const handleClose = () => {
        setOpenSuggestionDialog(false);
        setDescription('');
        setError('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }
        if (description.length > 255) {
            toast.error('Description cannot exceed 255 characters');
            return;
        }
        setError('');
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/suggestion`, {description}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200 || response.status === 201 ) {
                setDescription('');
                handleClose();
                toast.success('Suggestion submitted successfully!');
            } else {
                throw new Error('Failed to submit suggestion');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit suggestion. Please try again.');
        }
    };
    return (
        <>
            <Navbar />
           <main style={{ minHeight: "90vh", display: "flex", alignItems: "center", flexDirection: "column", justifyContent: "center" }}>
                <Contact />
                <Box sx={{ mt: 4, textAlign: 'center', width: '100%' }}>
                    <Typography variant="body1">
                        If you have any suggestions or problems about the web, please{' '}
                        <Button variant="text" color="primary" onClick={handleOpen} sx={{
                                '&:focus': {
                                    outline: 'none',
                                    boxShadow: 'none',
                                },
                            }}>
                            FILL THIS FORM
                        </Button>
                    </Typography>
                </Box>
            </main>
            <Footer />
            <Dialog open={openSuggestionDialog} onClose={handleClose}>
                <DialogTitle>Submit a Suggestion</DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={!!error}
                            helperText={error || 'Max 255 characters'}
                            inputProps={{ maxLength: 255 }}
                            autoFocus
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary" sx={{ "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" onClick={handleSubmit} sx={{ "&:focus": { outline: "none", boxShadow: "none" }, "&:active": { outline: "none", boxShadow: "none" } }}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
export default ContactPage; 