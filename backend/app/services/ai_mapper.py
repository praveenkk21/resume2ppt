import json
import re
from app.models import ResumeData

SYSTEM_PROMPT = """You are an expert at mapping structured resume data to PowerPoint presentation text boxes.
Your task is to intelligently fill a presentation template with resume content.

Rules:
1. Return ONLY a valid JSON object. No markdown, no explanation, no code fences.
2. Only include shapes that should receive new content.
3. Preserve the semantic purpose of each text box (titles stay titles, bullets stay bullets).
4. Keep text concise — match the available space implied by the shape's bounding box size.
5. If a shape clearly belongs to the template's design (logo, decorative text) and has no resume equivalent, omit it.
6. Never fabricate information not present in the resume.
7. For multi-line content (bullet points, multiple items), use \\n to separate lines.
8. Use the shape's shape_name and current_text as strong hints for what kind of content it expects."""


def _format_experience(experience: list) -> str:
    if not experience:
        return "None provided"
    lines = []
    for i, exp in enumerate(experience, 1):
        header = f"{i}. {exp.title or 'Role'} at {exp.company or 'Company'}"
        if exp.dates:
            header += f" ({exp.dates})"
        lines.append(header)
        for bullet in exp.bullets[:5]:
            lines.append(f"   - {bullet}")
    return "\n".join(lines)


def _format_education(education: list) -> str:
    if not education:
        return "None provided"
    lines = []
    for edu in education:
        parts = [edu.degree or "Degree", "at" if edu.school else "", edu.school or ""]
        line = " ".join(p for p in parts if p).strip()
        if edu.dates:
            line += f" ({edu.dates})"
        lines.append(line)
    return "\n".join(lines)


def _build_prompt(resume: ResumeData, inventory: list) -> str:
    exp_text = _format_experience(resume.experience)
    edu_text = _format_education(resume.education)

    resume_section = f"""## Resume Data

Name: {resume.name or 'N/A'}
Email: {resume.email or 'N/A'}
Phone: {resume.phone or 'N/A'}
LinkedIn: {resume.linkedin or 'N/A'}
Location: {resume.location or 'N/A'}

Summary:
{resume.summary or 'N/A'}

Experience:
{exp_text}

Education:
{edu_text}

Skills: {", ".join(resume.skills) if resume.skills else 'N/A'}

Certifications: {", ".join(resume.certifications) if resume.certifications else 'N/A'}

Languages: {", ".join(resume.languages) if resume.languages else 'N/A'}
"""

    inventory_section = f"""---

## PowerPoint Shape Inventory

{json.dumps(inventory, indent=2)}

---

## Task

Map the resume data to the PowerPoint shapes above.
Return a JSON object with EXACTLY this structure (no other text):
{{
  "<slide_index>": {{
    "<shape_id>": "<new text content>"
  }}
}}

Guidelines:
- A shape named "Title" or containing placeholder text like "Your Name" should receive the candidate's full name.
- Shapes with "email", "phone", "linkedin" hints → fill with the corresponding contact field.
- "Summary" or "Objective" shapes → paste the summary paragraph.
- "Skills" shapes → list the top skills (comma-separated or one per line depending on shape size).
- "Experience" shapes → format as concise bullet points for the most recent role(s).
- "Education" shapes → the most relevant education entry.
- Shapes with small bounding boxes → use very concise content (name, date, single line).
- Shapes with large bounding boxes → can hold multi-line content.
- Only output shape IDs that exist in the inventory above."""

    return resume_section + inventory_section


def _parse_json_response(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.MULTILINE)
    cleaned = cleaned.strip()
    try:
        mapping = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON: {e}\nRaw (first 500 chars): {raw[:500]}")
    for slide_key, shape_map in mapping.items():
        if not isinstance(shape_map, dict):
            raise ValueError(f"Invalid mapping structure at slide '{slide_key}': expected dict, got {type(shape_map)}")
    return mapping


def _heuristic_map(resume: ResumeData, inventory: list) -> dict:
    keyword_map = {
        "name": resume.name,
        "your name": resume.name,
        "candidate": resume.name,
        "full name": resume.name,
        "email": resume.email,
        "e-mail": resume.email,
        "phone": resume.phone,
        "mobile": resume.phone,
        "tel": resume.phone,
        "linkedin": resume.linkedin,
        "location": resume.location,
        "address": resume.location,
        "city": resume.location,
        "summary": resume.summary,
        "objective": resume.summary,
        "profile": resume.summary,
        "about": resume.summary,
        "professional summary": resume.summary,
        "skill": "\n".join(resume.skills) if resume.skills else None,
        "competenc": "\n".join(resume.skills) if resume.skills else None,
        "technolog": "\n".join(resume.skills) if resume.skills else None,
        "certification": "\n".join(resume.certifications) if resume.certifications else None,
        "language": "\n".join(resume.languages) if resume.languages else None,
    }

    # Format first experience entry
    first_exp = None
    if resume.experience:
        e = resume.experience[0]
        lines = [f"{e.title or ''} at {e.company or ''}".strip()]
        if e.dates:
            lines.append(e.dates)
        lines.extend(f"• {b}" for b in e.bullets[:4])
        first_exp = "\n".join(l for l in lines if l)

    experience_keywords = {"experience", "work", "employment", "history"}

    # Format first education entry
    first_edu = None
    if resume.education:
        ed = resume.education[0]
        parts = [ed.degree or "", ed.school or "", ed.dates or ""]
        first_edu = " | ".join(p for p in parts if p)

    education_keywords = {"education", "degree", "university", "school", "academic"}

    mapping: dict = {}

    for slide in inventory:
        slide_idx = str(slide["slide_index"])
        for shape in slide["shapes"]:
            sid = str(shape["shape_id"])
            haystack = (shape["shape_name"] + " " + shape["current_text"]).lower()

            matched_value = None

            # Check experience/education first (longer keywords)
            if any(kw in haystack for kw in experience_keywords):
                matched_value = first_exp
            elif any(kw in haystack for kw in education_keywords):
                matched_value = first_edu
            else:
                for keyword, value in keyword_map.items():
                    if keyword in haystack and value:
                        matched_value = value
                        break

            if matched_value:
                mapping.setdefault(slide_idx, {})[sid] = matched_value

    return mapping


def _call_claude(prompt: str, api_key: str) -> dict:
    import anthropic
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = message.content[0].text.strip()
    return _parse_json_response(raw)


def _call_openai(prompt: str, api_key: str) -> dict:
    from openai import OpenAI
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=4096,
    )
    raw = response.choices[0].message.content
    return _parse_json_response(raw)


def map_resume_to_ppt(
    resume: ResumeData,
    inventory: list,
    provider: str,
    api_key: str | None,
) -> dict:
    if provider == "none" or not provider:
        return _heuristic_map(resume, inventory)

    prompt = _build_prompt(resume, inventory)

    if provider == "claude":
        return _call_claude(prompt, api_key)
    elif provider == "openai":
        return _call_openai(prompt, api_key)
    else:
        raise ValueError(f"Unknown AI provider: {provider}")
