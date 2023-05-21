import './App.css';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { GridActionsCellItem } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { TextField } from '@mui/material';
import Stack from '@mui/material/Stack';


export default function App() {
  const [loggedin, setLoggedin] = useState(false);
  const [tasks, setTasks] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    (async () => {
      await fetch('http://localhost:8000/users/', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      await fetch('http://localhost:8000/users/', {
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => setTasks(data.map(task => ({...task, deadline: task.deadline ? new Date(task.deadline) : null}))));
    })();

    setLoggedin(true);
  }

  function makeHandleDelete(id) {
    function handleDelete() {
      fetch('http://localhost:8000/tasks/' + id, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'include'
      });
      setTasks(tasks.filter(task => task.id !== id));
    }
    return handleDelete;
  }

  function processRowUpdate(newRow) {
    fetch('http://localhost:8000/tasks/' + newRow.id, {
      method: 'PUT',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newRow.deadline ? {title: newRow.title, description: newRow.description, deadline: newRow.deadline} : {title: newRow.title, description: newRow.description})
    });
    setTasks(tasks.map(task => task.id === newRow.id ? newRow : task));
    return newRow;
  }

  function handleCreate() {
    fetch('http://localhost:8000/tasks/', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title: '', description: ''})
    })
    .then(response => response.json())
    .then(data => setTasks([...tasks, data]));
  }

  const rows = tasks;
  const columns = [
    { field: 'title', headerName: 'Title', editable: true, flex: 1 },
    { field: 'description', headerName: 'Description', editable: true, flex: 4 },
    { field: 'deadline', headerName: 'Deadline', type: 'dateTime', editable: true, flex: 2 },
    {
      field: 'actions',
      type: 'actions',
      getActions: params => [<GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={makeHandleDelete(params.id)} />],
      flex: 0.5,
    },
  ];

  return (
    <div>
      {loggedin ? (
        <div>
          <DataGrid
            rows={rows}
            columns={columns}
            processRowUpdate={processRowUpdate}
            disableRowSelectionOnClick
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>add</Button>
        </div>
      ) : (
        <Box component="form" method="post" onSubmit={handleSubmit} sx={{width: 300}}>
          <Stack direction="column" spacing={2}>
            <TextField type="text" id="username" name="username" label="Username" />
            <TextField type="password" id="password" name="password" label="Password" />
            <Button type="submit" variant="contained">sign in / sign up</Button>
          </Stack>
        </Box>
      )}
    </div>
  )
}
