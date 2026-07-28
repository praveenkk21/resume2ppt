import { useConvertResume } from "../hooks/useConvertResume.js";

const styles = {
  center: { textAlign: "center", padding: "8px 0 16px" },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 6px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0 0 28px 0",
  },
  cards: {
    display: "flex",
    gap: "14px",
    marginBottom: "16px",
  },
  card: (loading) => ({
    flex: 1,
    padding: "20px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    background: loading ? "#f5f3ff" : "#fff",
    cursor: loading ? "not-allowed" : "pointer",
    textAlign: "center",
    transition: "all 0.2s",
    opacity: loading ? 0.8 : 1,
  }),
  cardIcon: { fontSize: "32px", marginBottom: "8px" },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: "0 0 4px 0",
  },
  cardDesc: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(79,70,229,0.3)",
    borderTop: "2px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: "8px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "14px",
    fontSize: "13px",
    color: "#b91c1c",
    textAlign: "left",
  },
  resetBtn: {
    display: "block",
    width: "100%",
    padding: "12px",
    background: "#f3f4f6",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "4px",
  },
};

const FORMATS = [
  { key: "docx", icon: "📝", label: "Word Document", desc: ".docx — editable in Microsoft Word" },
  { key: "pdf", icon: "📄", label: "PDF", desc: ".pdf — ready to share or print" },
];

export default function ResumeFormatStep({ resumeFile, onReset }) {
  const { convertResume, loading, error } = useConvertResume();

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.center}>
        <h2 style={styles.title}>Export Resume</h2>
        <p style={styles.subtitle}>
          Download your resume as a formatted document in a new format.
        </p>
      </div>

      {error && <div style={styles.errorBox}>Error: {error}</div>}

      <div style={styles.cards}>
        {FORMATS.map(({ key, icon, label, desc }) => {
          const isLoading = loading[key];
          return (
            <div
              key={key}
              style={styles.card(isLoading)}
              onClick={() => !isLoading && convertResume({ resumeFile, outputFormat: key })}
            >
              {isLoading ? (
                <div style={styles.spinner} />
              ) : (
                <div style={styles.cardIcon}>{icon}</div>
              )}
              <p style={styles.cardTitle}>{isLoading ? "Generating..." : label}</p>
              <p style={styles.cardDesc}>{desc}</p>
            </div>
          );
        })}
      </div>

      <button style={styles.resetBtn} onClick={onReset}>
        Start Over
      </button>
    </div>
  );
}
