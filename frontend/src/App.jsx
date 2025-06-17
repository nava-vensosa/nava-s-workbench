import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    const endpoint = mode === "login" ? "/login" : "/signup";
    try {
      const res = await fetch(`${API_URL}/api${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, userid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsg(mode === "login" ? "Logged in!" : "Account created!");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={{ background: "#18181b", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "#27272a", padding: 32, borderRadius: 8 }}>
        <h2>{mode === "login" ? "Log In" : "Create Account"}</h2>
        <input placeholder="User Name" value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", margin: 8, padding: 8 }} />
        <input placeholder="User ID" value={userid} onChange={e => setUserid(e.target.value)} style={{ width: "100%", margin: 8, padding: 8 }} />
        <button type="submit" style={{ width: "100%", margin: 8, padding: 8 }}>{mode === "login" ? "Log In" : "Sign Up"}</button>
        <div style={{ marginTop: 8 }}>
          <span style={{ color: "#818cf8", cursor: "pointer" }} onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMsg(""); }}>
            {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Log in"}
          </span>
        </div>
        {msg && <div style={{ color: msg.includes("!") ? "lime" : "red", marginTop: 8 }}>{msg}</div>}
      </form>
    </div>
  );
}
