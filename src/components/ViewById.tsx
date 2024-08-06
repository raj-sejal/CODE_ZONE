import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import Notification from './Notification'
import ReactMarkdown from 'react-markdown'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { difficulty as Difficulty, status as Status } from '../Additional'
// Atom one light
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { AiOutlineLink } from 'react-icons/ai'
import { SiCodingninjas, SiGeeksforgeeks, SiLeetcode } from 'react-icons/si'
import { Add, Delete, Edit} from '@mui/icons-material'
import { Editor } from '@monaco-editor/react'

const ViewById = () => {
  const [problem, setProblem] = useState<any>(null)
  const { id } = useParams()
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const navigate = useNavigate();

  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<any>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { user } = useAuth();

  const updateProblem = async (updatedData: any, item: string) => {
    try {
      const userRef = doc(db, `users/${user?.uid}`)
      const problemRef = doc(userRef, `problems/${id}`)
      await setDoc(problemRef, updatedData, { merge: true })
      setSuccess(`${item} updated successfully`);
      setSuccessOpen(true);

      // Update problem
      const problemSnapshot = await getDoc(problemRef)
      const problem = problemSnapshot.data()
      setProblem(problem)
    }
    catch (err: any) {
      setError(err.message || 'Something went wrong');
      setErrorOpen(true);
    }
  }

  // Title
  const [title, setTitle] = useState(problem?.title || '')
  const [openTitle, setOpenTitle] = useState(false);
  const updateTitle = async () => {
    setOpenTitle(false);
    updateProblem({ title }, 'Title')
  }

  // Status
  const [status, setStatus] = useState(problem?.status || '')
  const [openStatus, setOpenStatus] = useState(false);
  const updateStatus = async () => {
    setOpenStatus(false);
    updateProblem({ status }, 'Status')
  }


  // Difficulty
  const [difficulty, setDifficulty] = useState(problem?.difficulty || '')
  const [openDifficulty, setOpenDifficulty] = useState(false);
  const updateDifficulty = async () => {
    setOpenDifficulty(false);
    updateProblem({ difficulty }, 'Difficulty')
  }

  // Description
  const [description, setDescription] = useState(problem?.description || '')
  const [openDescription, setOpenDescription] = useState(false);
  const updateDescription = async () => {
    setOpenDescription(false);
    updateProblem({ description }, 'Description')
  }

  // Code
  const [code, setCode] = useState(problem?.code || '')
  const [openCode, setOpenCode] = useState(false);
  const updateCode = async () => {
    setOpenCode(false);
    updateProblem({ code }, 'Code')
  }

  // Notes
  const [notes, setNotes] = useState(problem?.notes || '')
  const [openNotes, setOpenNotes] = useState(false);
  const updateNotes = async () => {
    setOpenNotes(false);
    updateProblem({ notes }, 'Notes')
  }

  // Add link
  const [link, setLink] = useState('')
  const [openLink, setOpenLink] = useState(false);
  const updateLink = async () => {
    setOpenLink(false);
    updateProblem({ links: [...problem.links, link] }, 'Links')
  }

  useEffect(() => {
    setTitle(problem?.title)
    setDifficulty(problem?.difficulty)
    setStatus(problem?.status)
    setDescription(problem?.description)
    setCode(problem?.code)
    setNotes(problem?.notes)
  }, [problem])

  useEffect(() => {
    const getProblem = async () => {
      try {
        const userRef = doc(db, `users/${user?.uid}`)
        const problemRef = doc(userRef, `problems/${id}`)
        const problemSnapshot = await getDoc(problemRef)
        const problem = problemSnapshot.data()
        if (!problem) {
          setError('Problem not found');
          setErrorOpen(true);
          return;
        }
        setProblem(problem)
      }
      catch (err: any) {
        setError(err.message || 'Something went wrong');
        setErrorOpen(true);
      }
    }
    getProblem()
  }, [id, user])
  const getIcon = (link: string, idx: any) => {
    if (link.includes('leetcode')) {
      return (
        <IconButton key={idx} href={link} target='_blank' rel='noreferrer'>
          <SiLeetcode />
        </IconButton>
      )
    }
    if (link.includes('codingninjas')) {
      return (
        <IconButton key={idx} href={link} target='_blank' rel='noreferrer'>
          <SiCodingninjas />
        </IconButton>
      )
    }
    if (link.includes('interviewbit')) {
      return (
        <IconButton key={idx} href={link} target='_blank' rel='noreferrer'>
          <img src="https://img.icons8.com/?size=1x&id=BaooGqbWDceE&format=png" alt="interviewbit" width={40} height={40} />
        </IconButton>
      )
    }
    if (link.includes('geeksforgeeks')) {
      return (
        <IconButton key={idx} href={link} target='_blank' rel='noreferrer'>
          <SiGeeksforgeeks />
        </IconButton>
      )
    }

    return (
      <IconButton key={idx} href={link} target='_blank' rel='noreferrer'>
        <AiOutlineLink />
      </IconButton>
    )
  }


  const handleDelete = async () => {
    try {
      const userRef = doc(db, `users/${user?.uid}`)
      const problemRef = doc(userRef, `problems/${id}`)
      await deleteDoc(problemRef)
      setSuccess('Problem deleted successfully');
      setSuccessOpen(true);
      setTimeout(() => {
        navigate('/problems');
      }, 1000);
    }
    catch (err: any) {
      setError(err.message || 'Something went wrong');
      setErrorOpen(true);
    }
  }

  return (
    <Box sx={{ width: '100%' }} padding={4}>
      {/* Error */}
      <Notification message={error} type="error" open={errorOpen} setOpen={setErrorOpen} />
      {/* Success */}
      <Notification message={success} type="success" open={successOpen} setOpen={setSuccessOpen} />
      {
        problem && < >
          {/* Title */}
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='h4' >{problem.title}</Typography>
            <IconButton onClick={() => setOpenTitle(true)}>
              <Edit />
            </IconButton>
            <Dialog open={openTitle} onClose={() => setOpenTitle(false)} maxWidth='sm' fullWidth>
              <DialogTitle>Edit title</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  id="title"
                  label="Title"
                  fullWidth
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
              </DialogContent>
              <DialogActions >
                <Button onClick={() => setOpenTitle(false)}>Cancel</Button>
                <Button onClick={updateTitle}>Update</Button>
              </DialogActions>

            </Dialog>
          </Stack>
          {/* Status and difficulty */}
          <Stack direction='row' spacing={1} sx={{ marginTop: 2 }} alignItems='center'>
            {/* Status */}
            {
              problem.status === 'Solved' ?
                <Chip sx={{ backgroundColor: 'success.light', color: 'white' }} label={problem.status} onClick={() => setOpenStatus(true)} />
                : problem.status === 'Attempted' ?
                  <Chip sx={{ backgroundColor: 'warning.light', color: 'white' }} label={problem.status} onClick={() => setOpenStatus(true)} />
                  : <Chip sx={{ backgroundColor: 'error.light', color: 'white' }} label={problem.status} onClick={() => setOpenStatus(true)} />
            }
            <Dialog open={openStatus} onClose={() => setOpenStatus(false)} maxWidth='sm' fullWidth>
              <DialogTitle>Edit status</DialogTitle>
              <DialogContent  >
                <TextField
                  id='status'
                  label='Status'
                  variant='outlined'
                  select
                  value={status}
                  margin='normal'
                  fullWidth
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {Status.map((item, index) => (
                    <MenuItem key={index} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </DialogContent>
              <DialogActions >
                <Button onClick={() => setOpenStatus(false)}>Cancel</Button>
                <Button onClick={updateStatus}>Update</Button>
              </DialogActions>
            </Dialog>
            {/* Difficulty */}
            {
              problem.difficulty === 'Easy' ?
                <Chip sx={{ backgroundColor: 'success.light', color: 'white' }} label={problem.difficulty} onClick={() => setOpenDifficulty(true)} />
                : problem.difficulty === 'Medium' ?
                  <Chip sx={{ backgroundColor: 'warning.light', color: 'white' }} label={problem.difficulty} onClick={() => setOpenDifficulty(true)} />
                  : <Chip sx={{ backgroundColor: 'error.light', color: 'white' }} label={problem.difficulty} onClick={() => setOpenDifficulty(true)} />
            }
            <Dialog open={openDifficulty} onClose={() => setOpenDifficulty(false)} maxWidth='sm' fullWidth>
              <DialogTitle>Edit difficulty</DialogTitle>
              <DialogContent >
                <TextField
                  id='difficulty'
                  label='Difficulty'
                  variant='outlined'
                  select
                  value={difficulty}
                  margin='normal'
                  fullWidth
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {Difficulty.map((item, index) => (
                    <MenuItem key={index} value={item}>{item}</MenuItem>
                  ))}
                </TextField>
              </DialogContent>
              <DialogActions >
                <Button onClick={() => setOpenDifficulty(false)}>Cancel</Button>
                <Button onClick={updateDifficulty}>Update</Button>
              </DialogActions>
            </Dialog>
            {
              <Stack direction='row' spacing={1} justifyContent={'center'} sx={{ overflowX: 'auto' }}>
                {problem.links.map((link: any, index: any) => (
                  getIcon(link, index)
                ))}
                <IconButton onClick={() => setOpenLink(true)} title='Add link' sx={{ marginLeft: 1 }}>
                  <Add/>
                </IconButton>
                <Dialog open={openLink} onClose={() => setOpenLink(false)} maxWidth='sm' fullWidth>
                  <DialogTitle>Add link</DialogTitle>
                  <DialogContent >
                    <TextField
                      id='link'
                      label='Link'
                      variant='outlined'
                      value={link}
                      margin='normal'
                      fullWidth
                      onChange={(e) => setLink(e.target.value)}
                    />
                  </DialogContent>
                  <DialogActions >
                    <Button onClick={() => setOpenLink(false)}>Cancel</Button>
                    <Button onClick={updateLink}>Add</Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            }
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ marginTop: 2 }} >
            {problem.tags.map((tag: any, index: any) => (
              <Chip key={index} label={tag} />
            ))}
          </Stack>
          {/* Description */}
          <Stack direction='row' spacing={1} alignItems='center' sx={{ marginTop: 2 }} >
            <Typography variant='h5'>Description</Typography>
            <IconButton onClick={() => setOpenDescription(true)}>
              <Edit />
            </IconButton>
          </Stack>
          <Dialog open={openDescription} onClose={() => setOpenDescription(false)} fullScreen  >
            <DialogTitle>Edit description</DialogTitle>
            <DialogContent>
              <Editor
                defaultLanguage="markdown"
                defaultValue="<!-- Please enter description here in markdown format...  -->"
                value={description}
                onChange={(e) => setDescription(e)}
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false
                  },
                  fontFamily: "'Roboto Mono', monospace"
                }}
                className='editor'
              />
            </DialogContent>
            <DialogActions >
              <Button onClick={() => setOpenDescription(false)}>Cancel</Button>
              <Button onClick={updateDescription}>Update</Button>
            </DialogActions>
          </Dialog>
          <Box>
            <ReactMarkdown
              children={problem.description}
              className='markdown'
            />
          </Box>

          <Divider sx={{ marginTop: 2 }} />

          {/* Code */}
          <Stack direction='row' spacing={1} alignItems='center' sx={{ marginTop: 2 }} >
            <Typography variant='h5'>Code</Typography>
            <IconButton onClick={() => setOpenCode(true)}>
              <Edit />
            </IconButton>
          </Stack>
          {problem.code && <Box sx={{ marginTop: 2, position: 'relative' }}>
            <Button variant='contained' onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} sx={{ position: 'absolute', right: 5, top: 5, zIndex: 1 }} disableElevation>Toggle mode</Button>
            <Button disableElevation variant="contained" onClick={() => {
              navigator.clipboard.writeText(problem.code)
              setSuccess('Copied to clipboard')
              setSuccessOpen(true)
            }
            } sx={{
              position: 'absolute',
              right: 140,
              top: 5,
              zIndex: 1

            }}>Copy</Button>
            <SyntaxHighlighter language='cpp' style={mode === 'light' ? atomOneLight : atomOneDark}
              wrapLongLines showLineNumbers customStyle={{
                padding: '1rem',
                fontSize: '1rem',
                lineHeight: '1.7',
                borderRadius: '0.5rem',
                border: '1px solid #eaeaea',
              }}>
              {problem.code}
            </SyntaxHighlighter>
          </Box>}
          <Dialog open={openCode} onClose={() => setOpenCode(false)} fullScreen>
            <DialogTitle>Edit code</DialogTitle>
            <DialogContent  >
              <Editor
                defaultLanguage="cpp"
                defaultValue="// Start coding here..."
                value={code}
                onChange={(e) => setCode(e)}
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false
                  },
                  fontFamily: "'Roboto Mono', monospace"
                }}
                className='editor'
              />
            </DialogContent>
            <DialogActions >
              <Button onClick={() => setOpenCode(false)}>Cancel</Button>
              <Button onClick={updateCode}>Update</Button>
            </DialogActions>
          </Dialog>

          {/* Notes */}
          <Stack direction='row' spacing={1} alignItems='center' sx={{ marginTop: 2 }} >
            <Typography variant='h5'>Notes</Typography>
            <IconButton onClick={() => setOpenNotes(true)}>
              <Edit />
            </IconButton>
          </Stack>
          <Box>
            <ReactMarkdown
              children={problem.notes}
              className='markdown'
            />
          </Box>
          <Dialog open={openNotes} onClose={() => setOpenNotes(false)} >
            <DialogTitle>Edit notes</DialogTitle>
            <DialogContent  >
              <TextField
                id='notes'
                label='Notes'
                variant='outlined'
                multiline
                rows={10}
                value={notes}
                margin='normal'
                fullWidth
                onChange={(e) => setNotes(e.target.value)}
              />
            </DialogContent>
            <DialogActions >
              <Button onClick={() => setOpenNotes(false)}>Cancel</Button>
              <Button onClick={updateNotes}>Update</Button>
            </DialogActions>
          </Dialog>

        </>
      }

      {/* Delete this problem */}
      <Button variant='contained' disableElevation color='error' sx={{ marginTop: 4 }} onClick={handleDelete} startIcon={<Delete />}>
        Delete this problem
      </Button>

    </Box>
  )
}

export default ViewById