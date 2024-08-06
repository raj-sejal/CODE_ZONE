import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import useAuth from '../hooks/useAuth'
import { Link } from 'react-router-dom';
import { GitHub } from '@mui/icons-material';

function Home() {
  const { user } = useAuth();
  return (
    <Stack direction="column" justifyContent="center" spacing={5} alignItems="center" width={'100%'} minHeight={'90vh'} >
      <Box>
        <Typography variant="h4" color="primary.main" >Hi, </Typography>
        <Typography variant="h1" color="secondary.main" >{user?.displayName || user?.email}</Typography>
        <Typography variant="h4" color="primary.main" >Welcome to</Typography>
        <Typography variant="h1" color="success.main" >Coding Space</Typography>
      </Box>
      <Typography variant="body1" color="primary.main" >A place to save your coding problems & much more</Typography>

      {/* Footer */}
      <Box sx={{ position: 'absolute', bottom: '2rem', left: '2rem' }} >
        <Typography variant="body1" color="text.secondary" >Made with ❤️ by </Typography>
        <Typography variant="h4" color="text.main" >Hritik Paswan</Typography>
      </Box>

      {/* Github Repo contribution */}
      <Box sx={{ position: 'absolute', bottom: '2rem', right: '2rem' }} >
        <Typography variant="body1" color="text.secondary" >Contribute to the project on </Typography>
        <Link to='https://github.com/artis2021/code-zone' target='_blank' style={{ textDecoration: 'none' }} >
          <Stack direction="row" spacing={1} alignItems="center" >
            <GitHub sx={{ width: '2rem', height: '2rem' }} />
            <Typography variant="h4" color="text.main" >Github</Typography>
          </Stack>
        </Link>
      </Box>
    </Stack>
  )
}

export default Home