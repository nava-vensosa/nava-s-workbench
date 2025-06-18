export default function ProposeHedge({ users, hedges, setHedges, userid, onBack }) {
  // Placeholder: Simple form to add a hedge title
  return (
    <div style={{ background: "#232337", padding: 32, borderRadius: 12, minWidth: 420 }}>
      <button onClick={onBack} style={{ marginBottom: 16, background:"#3b82f6",color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",cursor:"pointer" }}>← Back</button>
      <h3>Propose a Hedge</h3>
      <p>(Form UI coming soon!)</p>
    </div>
  );
}
