import { useEffect, useState } from "react";

export default function MyHedges({ hedges, setHedges, userid, users, onBack }) {
  const [userHedges, setUserHedges] = useState([]);

  useEffect(() => {
    const filteredHedges = hedges.filter(h => 
      h.hedgemasters.includes(userid) || 
      h.team_members.includes(userid) || 
      h.interested_attendees.includes(userid)
    );
    setUserHedges(filteredHedges);
  }, [hedges, userid]);

  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>My Hedges</h3>
      <ul>
        {userHedges.map(h => (
          <li key={h.id}>
            <b>{h.title}</b> 
            <span style={{color:"#aaa"}}>({h.calendar[0].date} {h.calendar[0].start}–{h.calendar[0].end})</span>
            <p>{h.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}