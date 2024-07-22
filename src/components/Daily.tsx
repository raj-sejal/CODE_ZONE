import { Autocomplete, Button, Card, CardContent, Chip, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth';
import { DailyTask, Problem } from '../Types';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { BiPlus } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { Timer } from '@mui/icons-material';
import Notification from './Notification';

const Daily = () => {
    const { user } = useAuth();
    const [task, setTask] = useState<DailyTask>();
    const [search, setSearch] = useState('')
    const [problems, setProblems] = useState<Problem[]>([])
    const [options, setOptions] = useState<string[]>([])
    const [taskProblems, setTaskProblems] = useState<Problem[]>([])
    const [error, setError] = useState<any>(null);
    const [success, setSuccess] = useState<any>(null);
    const [errorOpen, setErrorOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    useEffect(() => {
        // Get problems from the database
        const fetchProblems = async () => {
            try {
                const userRef = doc(db, `users/${user?.uid}`)
                const problemCollection = collection(userRef, 'problems')

                const snapshot = await getDocs(problemCollection)

                const problems: Problem[] = []
                const options: string[] = []
                snapshot.forEach((doc) => {
                    const data = doc.data()
                    problems.push({
                        id: doc.id,
                        title: data.title,
                        difficulty: data.difficulty,
                        tags: data.tags,
                        status: data.status,
                        code: data.code,
                        notes: data.notes,
                        links: data.links,
                        description: data.description,
                    })
                    options.push(data.title)
                })
                setProblems(problems)
                setOptions(options)
            } catch (err: any) {
                setError(err.message || 'Something went wrong')
                setErrorOpen(true)
            }
        }
        // Get tasks from database
        const getTasks = async () => {
            try {
                const userRef = doc(db, `users/${user?.uid}`)
                const today = new Date().toDateString()
                // Add all tasks from today's collection
                const task = doc(userRef, `/daily/${today}`)
                const snapshot = await getDoc(task)
                const data = snapshot.data()
                if (!data) {
                    return
                }

                setTask({
                    problems: data.problems
                })

                // Now get all the problems with these names
                const tasks: Problem[] = []
                data.problems.forEach((title: string) => {
                    const problem = problems.find((problem) => problem.title === title)
                    if (problem) {
                        tasks.push(problem)
                    }
                }
                )
                setTaskProblems(tasks)
            } catch (err: any) {
                setError(err.message || 'Something went wrong')
                setErrorOpen(true)
            }

        }
        fetchProblems()
        getTasks()

    }, [user, taskProblems, problems])

    const handleClick = async () => {
        // Check if already present
        const alreadyPresent = task?.problems.find((problem) => problem === search)
        if (alreadyPresent) {
            setError('Already present in today\'s task')
            setErrorOpen(true)
            return
        }
        try{

        const userRef = doc(db, `users/${user?.uid}`)
        const today = new Date().toDateString()
        const todatTask = task?.problems || []


        const newTask = [...todatTask, search]
        const taskRef = doc(userRef, `/daily/${today}`)


        await setDoc(taskRef, {
            problems: newTask
        }, { merge: true })

        // Update task problems
        const newProblem = problems.find((problem) => problem.title === search)
        if (newProblem) {
            setTaskProblems([...taskProblems, newProblem])
        }

        setSuccess("Successfully added to today's task")
        setSuccessOpen(true)
    }
    catch(err: any){
        setError(err.message || 'Something went wrong')
        setErrorOpen(true)
    }
    }


    const handleSearch = (event: any, value: string | null) => {
        setSearch(value || '')
    }

    const [remMinute, setRemMinute] = useState(0)
    const [remHour, setRemHour] = useState(0)
    const [remSecond, setRemSecond] = useState(0)

    setInterval(() => {
        const now = new Date()
        const rem = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        const diff = rem.getTime() - now.getTime()
        const remHour = Math.floor(diff / (1000 * 60 * 60))
        const remMinute = Math.floor((diff / (1000 * 60)) % 60)
        const remSecond = Math.floor((diff / 1000) % 60)
        setRemHour(remHour)
        setRemMinute(remMinute)
        setRemSecond(remSecond)
    }, 1000)


    return (
        <Stack position={'relative'} direction="row" justifyContent="center" spacing={4} alignItems="center" width={'100%'} minHeight={'90vh'} >
            {/* Error */}
            <Notification message={error} type="error" open={errorOpen} setOpen={setErrorOpen} />
            {/* Success */}
            <Notification message={success} type="success" open={successOpen} setOpen={setSuccessOpen} />
            {/* Timer that shows the remaining till 12 Midnight */}
            <Card sx={{ position: 'absolute', top: 5, right: 5, minWidth: 300 }} >
                <CardContent>
                    <Stack direction="row" justifyContent="center" spacing={1} alignItems="center" >
                        <Timer color='primary' sx={{ marginRight: 1, width: 40, height: 40 }} />
                        <Typography variant="h6" color="primary.main" >
                            Time Remaining
                        </Typography>
                    </Stack>
                    <Typography variant="h4" color="secondary.main" textAlign="center" >
                        {remHour} : {remMinute} : {remSecond}
                    </Typography>
                </CardContent>
            </Card>
            <Stack direction="column" justifyContent="center" spacing={1} padding={10} paddingLeft={15} flex={0.5}>
                <Typography variant="h4" color="primary.main" >Hi, </Typography>
                <Typography variant="h1" color="secondary.main" >{user?.displayName || user?.email}</Typography>
                <Typography variant="h4" color="primary.main" >Your Task for </Typography>
                <Typography variant="h1" color="success.main" >Today</Typography>
                <Typography variant="h4" color="primary.main" >are here.</Typography>
            </Stack>
            <Stack direction="column" spacing={5} height={'90vh'} sx={{ overflowY: 'auto' }} width={'100%'} padding={5} flex={0.5} justifyContent="center" >
                <Stack direction="column" spacing={2} >
                    <Typography variant="h4" color="primary.main" >Add a new task</Typography>
                    <Autocomplete
                        id='search'
                        options={options}
                        // Render an item in red color is it's not solved yet & in green if it's solved
                        renderInput={(params) => <TextField {...params} label='Search by title' variant='outlined' />}
                        fullWidth
                        onChange={handleSearch}
                    />
                    <Button disableElevation variant="contained" color="primary" onClick={handleClick} startIcon={<BiPlus />} >Add to Today's Task</Button>
                </Stack>
                <Stack direction='column'  >
                    {
                        taskProblems.map((problem) => (
                            <Stack direction="row" boxShadow={1} padding={2} borderRadius={1}>
                                {/* onhover underline */}
                                <Link to={`/problems/${problem.id}`} style={{ textDecoration: 'none' }} >
                                    <Typography variant="h5" color="primary.main" >{problem.title}</Typography>
                                </Link>
                                {
                                    problem.status === "Solved" ?
                                        <Chip label={problem.status} color="success" sx={{ marginLeft: 'auto' }} /> :
                                        <Chip label={problem.status} color="error" sx={{ marginLeft: 'auto' }} />
                                }
                            </Stack>

                        ))
                    }
                </Stack>
            </Stack>
        </Stack>
    )
}

export default Daily