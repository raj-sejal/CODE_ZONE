import { useState } from 'react'
import useAuth from '../hooks/useAuth'
import { Avatar, Box, Button, InputAdornment, LinearProgress, Stack, TextField, Typography } from '@mui/material'
import { PermIdentity, Image, Save } from '@mui/icons-material'
import {StorageReference, UploadTask, getDownloadURL, ref, uploadBytesResumable} from 'firebase/storage'
import { Link, useNavigate } from 'react-router-dom'
import { storage } from '../config/firebase'
import Notification from './Notification'

const EditProfile = () => {
    const [name, setName] = useState('')
    const [error, setError] = useState<any>(null)
    const [success, setSuccess] = useState<any>(null)
    const [errorOpen, setErrorOpen] = useState(false)
    const [successOpen, setSuccessOpen] = useState(false)
    const [image, setImage] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const { user, updateUser } = useAuth()
    const [progress, setProgress] = useState(0)
    const [preview, setPreview] = useState<any>(user?.photoURL)
    const navigate = useNavigate()

    // Handlers
    const handleName = (e: any) => {
        setName(e.target.value)
    }

    const handleImage = (e: any) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0])
            setPreview(URL.createObjectURL(e.target.files[0]))
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        if( !image && !name){
            setError('Please enter a name or upload an image')
            setErrorOpen(true)
            return
        }

        if(image){
            try{
                setLoading(true)
                const storageRef: StorageReference = ref(storage, `users/${user?.uid}/profile.jpg`);
                const uploadTask: UploadTask = uploadBytesResumable(storageRef, image);
                uploadTask.on('state_changed', (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress)
                });
                await uploadTask;
                const url = await getDownloadURL(storageRef);
                setLoading(false)
                await updateUser(name || user?.displayName, url)
                setSuccess('Profile updated successfully')
                setSuccessOpen(true)

                // Redirect to home page after 1s
                setTimeout(() => {
                    navigate('/');
                }
                , 1000);
                    

            }
            catch(err: any){
                setError(err.message || 'Something went wrong')
                setErrorOpen(true);
            }
        }
        else{
            try{
                await updateUser(name, user?.photoURL)
                setSuccess('Profile updated successfully')
                setSuccessOpen(true)

                // Redirect to home page after 1s
                setTimeout(() => {
                    navigate('/');
                }
                , 1000);
            }
            catch(err: any){
                setError(err.message || 'Something went wrong')
                setErrorOpen(true);
            }
        }

    }

    return (
        <Box sx={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Error */}
            <Notification message={error} type="error" open={errorOpen} setOpen={setErrorOpen} />
            {/* Success */}
            <Notification message={success} type="success" open={successOpen} setOpen={setSuccessOpen} />
            <Stack spacing={2} maxWidth="400px" width="100%" padding={4} component="form" sx={{ boxShadow: 3, borderRadius: 2, background: 'white' }} >
                {/* Image */}
                <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" >
                    <Typography variant="h4" color="primary.main" >Edit Profile</Typography>
                    <Avatar src={preview} sx={{ width: '100px', height: '100px' }} />
                </Stack>
                <TextField
                    margin="normal"
                    fullWidth
                    id="name"
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={handleName}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <PermIdentity />
                            </InputAdornment>
                        ),
                    }}
                />
                {/* Image button */}
                <TextField
                    margin="normal"
                    id="image"
                    label="Image"
                    variant="outlined"
                    fullWidth
                    type="file"
                    onChange={handleImage}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Image />
                            </InputAdornment>
                        ),
                    }}
                />

                {loading && <LinearProgress variant="determinate" value={progress} />}
                    
                {/* Submit button */}
                <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" >
                    <Button variant="contained" color="primary" disableElevation fullWidth onClick={handleSubmit}  startIcon={<Save />} >
                        Update
                    </Button>
                    <Link to="/" style={{ textDecoration: 'none' }} >
                        <Button variant="outlined" color="primary" disableElevation fullWidth >
                            Cancel
                        </Button>
                    </Link>
                </Stack>
            </Stack>
        </Box>            
    )
}

export default EditProfile