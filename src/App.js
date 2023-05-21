import './App.css';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


export default function App() {
  const [loggedin, setLoggedin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

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

  function handleDeletion() {
    selectedTasks.forEach(task_id => fetch('http://localhost:8000/tasks/' + task_id, {
      method: 'DELETE',
      mode: 'cors',
      credentials: 'include'
    }));
    setTasks(tasks.filter(task => selectedTasks.every(task_id => task_id !== task.id)));
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
    const idx = tasks.findIndex(e => e.id === newRow.id);
    tasks[idx] = newRow;
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
    { field: 'title', headerName: 'Title', editable: true },
    { field: 'description', headerName: 'Description', editable: true },
    { field: 'deadline', headerName: 'Deadline', type: 'dateTime', editable: true },
  ];

  return (
    <div>
      {loggedin ? (
        <div>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            rowSelectionModel={selectedTasks}
            onRowSelectionModelChange={newSelectedTasks => setSelectedTasks(newSelectedTasks)}
            processRowUpdate={processRowUpdate}
          />
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>add</Button>
            <Button variant="outlined" startIcon={<DeleteIcon />} onClick={handleDeletion}>delete</Button>
          </Stack>
        </div>
      ) : (
        <form method="post" onSubmit={handleSubmit}>
          <label>
            Username: <input type="text" name="username" />
          </label>
          <label>
            Password: <input type="password" name="password" />
          </label>
          <button type="reset">Reset</button>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  )
}
