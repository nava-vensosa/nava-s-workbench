import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProposeHedge({ users, setHedges }) {
  const navigate = useNavigate();
  const [hedgeName, setHedgeName] = useState("");
  const [hedgemaster, setHedgemaster] = useState("");
  const [description, setDescription] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newHedge = {
      name: hedgeName,
      hedgemaster: hedgemaster,
      description: description,
      team_members: teamMembers,
      date: date,
      time: time,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/hedges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newHedge),
      });

      if (response.ok) {
        const savedHedge = await response.json();
        setHedges((prevHedges) => [...prevHedges, savedHedge]);
        navigate("/labcalendar"); // Redirect to Lab Calendar after submission
      } else {
        console.error("Failed to save hedge:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting hedge:", error);
    }
  };

  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <h3>Propose a Hedge</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            What's the Name of your Hedge?
            <input type="text" value={hedgeName} onChange={(e) => setHedgeName(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Who's the Hedgemaster?
            <select value={hedgemaster} onChange={(e) => setHedgemaster(e.target.value)} required>
              <option value="">Select a Hedgemaster</option>
              {users.map((user) => (
                <option key={user.userid} value={user.userid}>{user.username}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Write a Brief Description of the Hedge
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
        </div>
        <div>
          <label>
            Select Any Critical Team Members from the List of Users
            <select multiple value={teamMembers} onChange={(e) => setTeamMembers([...e.target.selectedOptions].map(option => option.value))}>
              {users.map((user) => (
                <option key={user.userid} value={user.userid}>{user.username}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Select a Date & Time for your Hedge
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
        </div>
        <button type="submit" style={{ marginTop: 16, background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer" }}>
          Submit Hedge
        </button>
      </form>
    </div>
  );
}