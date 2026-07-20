import { useState, useRef } from "react";

const styles = {
  section: { marginBottom: "20px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  dropzone: (isDragging, hasFile) => ({
    border: `2px dashed ${hasFile ? "#4f46e5" : isDragging ? "#818cf8" : "#d1d5db"}`,
    borderRadius: "10px",
    padding: "24px 16px",
    textAlign: "center",
    cursor: "pointer",
    background: isDragging ? "#eef2ff" : hasFile ? "#f5f3ff" : "#fafafa",
    transition: "all 0.2s",
  }),
  dropzoneText: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "0",
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#4f46e5",
    margin: "0",
  },
  fileSize: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: "4px 0 0 0",
  },
  btn: (disabled) => ({
    marginTop: "28px",
    width: "100%",
    padding: "13px",
    background: disabled ? "#d1d5db" : "#4f46e5",
    color: disabled ? "#9ca3af" : "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s",
  }),
};

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileDropzone({ label, accept, file, onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }

  return (
    <div style={styles.section}>
      <span style={styles.label}>{label}</span>
      <div
        style={styles.dropzone(dragging, !!file)}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <>
            <p style={styles.fileName}>📄 {file.name}</p>
            <p style={styles.fileSize}>{formatBytes(file.size)}</p>
          </>
        ) : (
          <p style={styles.dropzoneText}>
            Click or drag & drop your file here<br />
            <span style={{ color: "#9ca3af", fontSize: "11px" }}>Accepted: {accept}</span>
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
        />
      </div>
    </div>
  );
}

export default function UploadStep({ onFilesSelected }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);

  const ready = !!resumeFile && !!templateFile;

  return (
    <div>
      <FileDropzone
        label="Resume (PDF or DOCX)"
        accept=".pdf,.docx"
        file={resumeFile}
        onFile={setResumeFile}
      />
      <FileDropzone
        label="PowerPoint Template (.pptx)"
        accept=".pptx"
        file={templateFile}
        onFile={setTemplateFile}
      />
      <button
        style={styles.btn(!ready)}
        disabled={!ready}
        onClick={() => onFilesSelected(resumeFile, templateFile)}
      >
        Next →
      </button>
    </div>
  );
}
