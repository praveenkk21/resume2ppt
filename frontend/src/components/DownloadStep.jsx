const styles = {
  center: { textAlign: "center", padding: "16px 0" },
  icon: { fontSize: "52px", marginBottom: "12px" },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#16a34a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 32px 0",
  },
  nextBtn: {
    display: "block",
    width: "100%",
    padding: "14px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "background 0.2s",
  },
  downloadBtn: {
    display: "block",
    width: "100%",
    padding: "14px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "12px",
    transition: "background 0.2s",
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
  },
};

export default function DownloadStep({ resultBlob, onReset, onNext }) {
  function handleDownload() {
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filled_resume.pptx";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.center}>
      <div style={styles.icon}>🎉</div>
      <h2 style={styles.title}>Your PPT is ready!</h2>
      <p style={styles.subtitle}>
        Resume data has been mapped into your template. Download and open in PowerPoint.
      </p>
      <button style={styles.nextBtn} onClick={onNext}>
        Next: Export Resume Format →
      </button>
      <button style={styles.downloadBtn} onClick={handleDownload}>
        Download filled_resume.pptx
      </button>
      <button style={styles.resetBtn} onClick={onReset}>
        Start Over
      </button>
    </div>
  );
}
