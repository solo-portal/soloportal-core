export default function PrototypePage() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", margin: 0, padding: 0 }}>
      <iframe
        src="/prototype/index.html"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Solo Portal Interactive Prototype"
      />
    </div>
  );
}
