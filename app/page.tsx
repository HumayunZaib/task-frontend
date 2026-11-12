"use client";
import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;
type Task = { id: number; title: string; description: string | null; completed: boolean };

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) loadTasks();
  }, [token]);

  async function login() {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });
    if (!res.ok) return setError("Login failed");
    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setError("");
  }

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) return logout();
    setTasks(await res.json());
  }

  async function addTask() {
    await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    loadTasks();
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  }

  if (!token) {
    return (
      <main style={{ padding: 40, maxWidth: 360 }}>
        <h1>Login</h1>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <br />
        <button onClick={login}>Login</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={{ padding: 40, maxWidth: 480 }}>
      <h1>My Tasks</h1>
      <button onClick={logout}>Logout</button>
      <div style={{ margin: "16px 0" }}>
        <input placeholder="New task" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={addTask}>Add</button>
      </div>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>{t.title}</li>
        ))}
      </ul>
    </main>
  );
}