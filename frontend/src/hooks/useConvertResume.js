import { useState } from "react";

export function useConvertResume() {
  const [loading, setLoading] = useState({ docx: false, pdf: false });
  const [error, setError] = useState(null);

  async function convertResume({ resumeFile, outputFormat }) {
    setLoading((l) => ({ ...l, [outputFormat]: true }));
    setError(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("output_format", outputFormat);

    try {
      const res = await fetch("/api/convert-resume", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let detail = "Export failed.";
        try {
          const err = await res.json();
          detail = err.detail || detail;
        } catch (_) {}
        throw new Error(detail);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume.${outputFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading((l) => ({ ...l, [outputFormat]: false }));
    }
  }

  return { convertResume, loading, error };
}
