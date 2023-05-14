import logo from './logo.svg';
import './App.css';
import { useState } from 'react';


export default function App() {
  const [login, setLogin] = useState(0);
  const [taskList, setTaskList] = useState([]);

  function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch('http://localhost:8000/users/', {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    fetch('http://localhost:8000/users/', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => setTaskList(data));

    setLogin(1);
  }

  const taskListItems = taskList.map(task => <li key={task.task_id}>{task.title}</li>);

  return (
    <div>
      {login ? (
        <ul>{taskListItems}</ul>
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