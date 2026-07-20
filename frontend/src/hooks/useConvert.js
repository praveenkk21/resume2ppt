import { useState } from "react";
import { convertResume } from "../api";

export function useConvert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultBlob, setResultBlob] = useState(null);

  async function convert({ resumeFile, templateFile, aiProvider, apiKey }) {
    setLoading(true);
    setError(null);
    setResultBlob(null);

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("template", templateFile);
    formData.append("ai_provider", aiProvider);
    if (apiKey) formData.append("api_key", apiKey);

    try {
      const blob = await convertResume(formData);
      setResultBlob(blob);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return { convert, loading, error, resultBlob };
}
