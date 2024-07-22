import { Editor } from '@monaco-editor/react'
import { ChangeCircle, PlayCircle } from '@mui/icons-material';
import { Button, ButtonGroup, MenuItem, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import axios from 'axios';
import Notification from './Notification';

const Compiler = () => {
    const [language, setLanguage] = useState('cpp');
    const [processing, setProcessing] = useState(false);
    const [files, setFiles] = useState([
        {
            name: 'Code',
            language: 'cpp',
            value: ''
        },
        {
            name: 'Input',
            language: 'txt',
            value: ''
        },
        {
            name: 'Output',
            language: 'txt',
            value: ''
        }
    ]);
    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState<any>(null);
    const [errorOpen, setErrorOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [activeFileIndex, setActiveFileIndex] = useState(0);
    const [theme, setTheme] = useState('light');
    const languageOptions = [
        'cpp',
        'c',
        'python',
        'java',
        'javascript'
    ]
    useEffect(() => {
        if(files[0].language === language) return;
        const newFiles = [...files];
        newFiles[0].language = language;
        setSuccess('Language changed');
        setFiles(newFiles);
        setSuccessOpen(true);
    }, [language, files])

    const handleRun = async () => {
        setProcessing(true);

        if(!files[0].value){
            setError('Please enter some code');
            setErrorOpen(true);
            setProcessing(false);
            return;
        }

        const options = {
            method: 'POST',
            url: 'https://online-code-compiler.p.rapidapi.com/v1/',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
                'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST
            },
            data: {
                language: language,
                version: 'latest',
                code: files[0].value,
                input: files[1].value
            }
        };

        try {
            const response = await axios.request(options);
            setProcessing(false);
            const newFiles = [...files];
            newFiles[2].value = response.data.output;
            setSuccess(`Code ran successfully in ${response.data.cpuTime} ms`);
            setSuccessOpen(true);
            setFiles(newFiles);
        } catch (error: any) {
            setError(error.message || 'Something went wrong');  
            setErrorOpen(true);
            setProcessing(false);
        }
    }

    return (
        <Stack direction="column" width={'100%'} >
            {/* Error */}
            <Notification message={error} type="error" open={errorOpen} setOpen={setErrorOpen} />
            {/* Success */}
            <Notification message={success} type="success" open={successOpen} setOpen={setSuccessOpen} />
            <Stack direction={'row'} alignItems="center" spacing={2} padding={2} justifyContent={'space-between'} >
                <ButtonGroup disableElevation variant="outlined" aria-label="Buttons" size='large' >
                    {files.map((file, index) => (
                        <Button key={index} onClick={() => setActiveFileIndex(index)}
                            sx={{
                                backgroundColor: activeFileIndex === index ? '#e0e0e0' : '#fff',
                                color: 'black',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.5rem',
                            }}
                        >
                            {file.name}
                        </Button>
                    ))}
                </ButtonGroup>
                <Stack direction={'row'} alignItems="center" spacing={2} >
                <Button disableElevation disabled={processing} variant="contained" color='success' size='large' startIcon={<PlayCircle />} onClick={handleRun} >
                    {processing ? 'Running...' : 'Run'}
                </Button>
                <Button disableElevation variant="contained" color='info' size='large' startIcon={<ChangeCircle />} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} >
                   Toggle {theme === 'light' ? 'Dark' : 'Light'}
                </Button>
                </Stack>
                <TextField
                    select
                    label="Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    helperText="Please select your language"
                >
                    {languageOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

            </Stack>
            <Editor
                height={610}
                defaultLanguage='cpp'
                language={files[activeFileIndex].language}
                value={files[activeFileIndex].value}
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                onChange={(value) => {
                    const newFiles = [...files];
                    newFiles[activeFileIndex].value = value as string;
                    setFiles(newFiles);
                }
                }
                options={{
                    fontSize: 14,
                    minimap: {
                        enabled: false
                    },
                    fontFamily: "'Roboto Mono', monospace",
                }}
                className='editor'
            />
        </Stack>
    )
}

export default Compiler