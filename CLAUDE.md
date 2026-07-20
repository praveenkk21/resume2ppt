# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app does

A web app that accepts a resume (PDF or DOCX) and a PowerPoint template (.pptx), then fills the PPT text boxes with resume content — preserving all design, fonts, colors, and layout. Optionally uses Claude or OpenAI (user-supplied key) for intelligent semantic mapping; falls back to keyword heuristics when no key is provided.

## Development commands

### Backend (Python / FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: `http://localhost:8000/docs`

### Frontend (React / Vite)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
```

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so both servers must run concurrently during development.

## Architecture

### Request flow

```
Browser → POST /api/convert (multipart: resume file, pptx template, ai_provider, api_key)
  → resume_parser.py   — extract raw text, parse into ResumeData struct
  → ppt_handler.py     — walk prs.slides, collect text shapes into inventory list
  → ai_mapper.py       — send resume + inventory to AI (or run heuristic), get {slide: {shape_id: text}} JSON
  → ppt_handler.py     — apply_mapping(): write new text run-by-run, preserving all formatting
  → StreamingResponse  — return filled .pptx bytes
```

### Backend modules

- [app/services/resume_parser.py](backend/app/services/resume_parser.py) — `parse_resume(bytes, filename) -> ResumeData`. Detects sections via title-case/all-caps headers, parses experience/education with date-range regex, contact fields via regex on first 20 lines.
- [app/services/ppt_handler.py](backend/app/services/ppt_handler.py) — `extract_shape_inventory(bytes)` returns list of `{slide_index, shapes[{shape_id, shape_name, current_text, bbox}]}`. `apply_mapping(bytes, mapping)` writes text into existing runs (never deletes runs, never sets `text_frame.text` directly — both destroy formatting).
- [app/services/ai_mapper.py](backend/app/services/ai_mapper.py) — `map_resume_to_ppt(resume, inventory, provider, api_key)`. Builds a two-section prompt (resume data + inventory JSON), calls claude-opus-4-5 or gpt-4o, strips markdown fences, parses JSON. Heuristic fallback scans `shape_name + current_text` for keywords.
- [app/routes/convert.py](backend/app/routes/convert.py) — Three endpoints: `GET /api/health`, `POST /api/preview-shapes` (returns inventory for debugging), `POST /api/convert`.
- [app/models.py](backend/app/models.py) — Pydantic models: `ResumeData`, `ExperienceEntry`, `EducationEntry`, `ShapeMeta`, `SlideMeta`.

### Frontend components

- [src/App.jsx](frontend/src/App.jsx) — Step state machine (`step: 1|2|3`). Holds `resumeFile`, `templateFile`, and `useConvert` hook state.
- [src/hooks/useConvert.js](frontend/src/hooks/useConvert.js) — Builds `FormData`, calls `POST /api/convert`, stores `response.blob()`.
- Step components: `UploadStep` (drag-and-drop for both files) → `ConfigStep` (AI provider radio + key input + convert trigger) → `DownloadStep` (`URL.createObjectURL` download).

## Critical implementation constraint

**Never use `shape.text_frame.text = "..."` in `ppt_handler.py`.** This is a destructive python-pptx operation that replaces the entire XML subtree with a single unstyled run, losing all fonts, colors, sizes, and bold/italic formatting from the template. Always write into existing `run.text` properties and clone paragraph XML when extra lines are needed.

## AI mapping output contract

The AI must return (and `_parse_json_response` validates) exactly:
```json
{ "<slide_index_str>": { "<shape_id_str>": "<new text, \\n for multiline>" } }
```
Both Claude and OpenAI are called with `max_tokens=4096`. OpenAI uses `response_format={"type": "json_object"}`. Claude may wrap output in markdown fences — these are stripped by regex before `json.loads`.
