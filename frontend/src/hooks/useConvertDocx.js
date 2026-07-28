import { useState } from "react";

export function useConvertDocx() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);

  async function convertDocx({ resumeFile, templateFile, aiProvider, apiKey }) {
    setLoading(true);
    setError(null);
    setResultBlob(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("template", templateFile);
    formData.append("ai_provider", aiProvider);
    if (apiKey) formData.append("api_key", apiKey);

    try {
      const res = await fetch("/api/convert-docx", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let detail = "DOCX conversion failed.";
        try {
          const err = await res.json();
          detail = err.detail || detail;
        } catch (_) {}
        throw new Error(detail);
      }
      const blob = await res.blob();
      setResultBlob(blob);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { convertDocx, loading, error, resultBlob };
}
