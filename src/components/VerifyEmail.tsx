import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import useAuth from '../hooks/useAuth';
import Notification from './Notification';
import { Link } from 'react-router-dom';


const VerifyEmail = () => {
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState<any>(null);
    const [errorOpen, setErrorOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    const {verifyEmail} = useAuth();

    const handleClick = async () => {
        try{
            await verifyEmail();
            setSent(true);
            setSuccess('Email sent successfully');
            setSuccessOpen(true);
        }
        catch(err: any){
            if(err.code === 'auth/too-many-requests'){
                setError('Too many requests. Please try again later');
            }
            else if(err.code === 'auth/sesion-expired'){
                setError('Session expired. Please login again');
            }
            else{
                setError(err.message || 'Something went wrong');
            }
            setErrorOpen(true);
        }
    };


    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
            {/* Error */}
            <Notification message={error} type="error" open={errorOpen} setOpen={setErrorOpen} />
            {/* Success */}
            <Notification message={success} type="success" open={successOpen} setOpen={setSuccessOpen} />
            <Stack spacing={2} maxWidth="400px" width="100%" padding={4} component="form" sx={{ boxShadow: 3, borderRadius: 2, background: 'white' }} >
                <Typography variant="h4" color="primary.main" >Verify Email</Typography>
                <Typography variant="body1" color="text.secondary" >An email will be sent to you to verify your account with further instructions.</Typography>
                <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" >
                    <Button variant="contained" color="primary" disableElevation fullWidth onClick={handleClick} >
                    {sent ? 'Resend Email' : 'Send Email'}
                    </Button>
                    <Link to="/" style={{ textDecoration: 'none' }} >
                        <Button variant="outlined" color="primary" disableElevation fullWidth >
                            Home
                        </Button>
                    </Link>
                </Stack>
            </Stack>

        </Box>
    )
}

export default VerifyEmail