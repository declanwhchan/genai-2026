import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

REQUIRED_WATSONX_VARS = [
    "WATSONX_API_URL",
    "WATSONX_API_KEY",
    "PROJECT_ID",
]

DEFAULT_REFERENCE_DOCUMENT = "reference_document.md"
MAX_REFERENCE_DOCUMENT_CHARS = 16000


def _extract_json_from_text(text: str):
    """Extract the first valid JSON object or array from a model response."""
    if not isinstance(text, str):
        return text

    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"(\{.*\}|\[.*\])", text, re.S)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass

    return text


def _missing_watsonx_vars():
    return [name for name in REQUIRED_WATSONX_VARS if not os.getenv(name)]


def _mask_value(value: str | None, visible_chars: int = 4):
    if not value:
        return None

    if len(value) <= visible_chars * 2:
        return value

    return f"{value[:visible_chars]}...{value[-visible_chars:]}"


def _normalize_watsonx_url(raw_url: str | None):
    if not raw_url:
        return None

    parsed = urlparse(raw_url.strip())
    if not parsed.scheme or not parsed.netloc:
        return raw_url.strip().rstrip("/")

    host = parsed.netloc.lower()
    if host.startswith("api.") and host.endswith(".watsonx.ai"):
        region = host[len("api.") : -len(".watsonx.ai")]
        if region:
            return f"{parsed.scheme}://{region}.ml.cloud.ibm.com"

    return f"{parsed.scheme}://{parsed.netloc}"


def _resolve_reference_document_path() -> Path:
    configured_path = os.getenv("SOURCE_DOCUMENT_PATH", DEFAULT_REFERENCE_DOCUMENT)
    candidate = Path(configured_path)
    if not candidate.is_absolute():
        candidate = Path(__file__).resolve().parent / candidate
    return candidate


def _normalize_reference_document(name: str, text: str, source: str, path: str | None = None):
    normalized_name = name.strip() if isinstance(name, str) and name.strip() else "Attached document"
    normalized_text = text.strip() if isinstance(text, str) else ""

    if not normalized_text:
        return None

    truncated = False
    if len(normalized_text) > MAX_REFERENCE_DOCUMENT_CHARS:
        normalized_text = normalized_text[:MAX_REFERENCE_DOCUMENT_CHARS]
        truncated = True

    return {
        "name": normalized_name,
        "path": path,
        "text": normalized_text,
        "truncated": truncated,
        "source": source,
    }


def _load_reference_document_from_request(body):
    payload = body.get("referenceDocument")
    if not isinstance(payload, dict):
        return None

    name = payload.get("name") if isinstance(payload.get("name"), str) else "Attached document"
    text = payload.get("text") if isinstance(payload.get("text"), str) else ""
    return _normalize_reference_document(name, text, source="request")


def _load_reference_document_from_disk():
    candidate = _resolve_reference_document_path()
    if not candidate.exists() or not candidate.is_file():
        return None

    try:
        text = candidate.read_text(encoding="utf-8")
    except Exception:
        return None

    return _normalize_reference_document(
        candidate.name,
        text,
        source="filesystem",
        path=str(candidate),
    )


def _load_reference_document(body=None):
    if isinstance(body, dict):
        request_document = _load_reference_document_from_request(body)
        if request_document:
            return request_document

    return _load_reference_document_from_disk()

def _count_document_backed_stages(parsed_response):
    if not isinstance(parsed_response, dict):
        return 0

    stages = parsed_response.get("stages")
    if not isinstance(stages, list):
        return 0

    return sum(
        1
        for stage in stages
        if isinstance(stage, dict) and stage.get("sourceBasis") == "document"
    )


def _build_watsonx_prompt(system_prompt: str, user_input: str, reference_document):
    source_guidance = """
Source attribution requirements:
- If vector-database retrieved context is provided, treat it as the highest-priority source of truth.
- Prefer the retrieved vector-database context over model prior knowledge whenever they differ.
- Do not override or embellish retrieved vector-database facts unless the context is clearly incomplete.
- Only use general medical knowledge to fill gaps that are not covered by the retrieved vector-database context.
- Return a top-level `sourceSummary` object with:
  - `documentName`: the document file name or null
  - `primarySourceType`: one of `document`, `mixed`, or `llm`
  - `note`: a short explanation of how much of the answer came from the retrieved context versus model reasoning
- For every stage include:
  - `sourceBasis`: `document` if the stage details are supported by the retrieved vector-database context, otherwise `llm`
  - `sourceNote`: a short explanation of whether that stage came from the retrieved context or from model reasoning used to fill a gap
- Never claim a detail is context-backed unless it is reasonably supported by the retrieved vector-database context.
- If retrieved vector-database context is available, at least 2 stages must be directly supported by that context and marked with `sourceBasis: document`.
- If needed, merge or reorganize stage boundaries so you can produce at least 2 context-backed stages before using `llm` fill-ins.
- If the retrieved context does not cover the disease well, you may use general medical knowledge to fill in gaps, but mark those parts as `llm`.
""".strip()

    if reference_document:
        source_label = (
            "user-attached document"
            if reference_document.get("source") == "request"
            else "server reference document"
        )
        document_section = f"""
Vector database context source: {source_label}
Vector database context name: {reference_document['name']}
Retrieved vector database context (highest-priority evidence):
<<<REFERENCE_DOCUMENT
{reference_document['text']}
REFERENCE_DOCUMENT>>>
""".strip()
        if reference_document.get("truncated"):
            document_section += "\nNote: The retrieved vector-database context was truncated for prompt size limits."
    else:
        document_section = (
            "No vector-database context is available. Use general medical knowledge only and "
            "set `sourceSummary.primarySourceType` to `llm` and all `sourceBasis` values to `llm`."
        )

    return (
        f"{system_prompt}\n\n"
        f"{source_guidance}\n\n"
        f"{document_section}\n\n"
        f"Input: {user_input}\n"
        "Output:"
    )

def get_watsonx_model():
    """Initialize the WatsonX model client."""
    missing = _missing_watsonx_vars()
    if missing:
        raise RuntimeError(
            "WatsonX is not configured. Missing environment variables: "
            + ", ".join(missing)
        )

    credentials = Credentials(
        url=_normalize_watsonx_url(os.getenv("WATSONX_API_URL")),
        api_key=os.getenv("WATSONX_API_KEY"),
    )

    return ModelInference(
        model_id="meta-llama/llama-3-3-70b-instruct",
        params={
            "decoding_method": "greedy",
            "max_new_tokens": 900,
            "temperature": 0,
        },
        credentials=credentials,
        project_id=os.getenv("PROJECT_ID"),
    )


@app.route("/api/health", methods=["GET"])
def health_check():
    missing = _missing_watsonx_vars()
    reference_document = _load_reference_document_from_disk()
    return jsonify(
        {
            "status": "ok" if not missing else "error",
            "watsonxConfigured": not missing,
            "missingEnvVars": missing,
            "referenceDocumentLoaded": bool(reference_document),
            "referenceDocumentName": reference_document["name"] if reference_document else None,
            "referenceDocumentSource": reference_document["source"] if reference_document else None,
            "watsonxApiUrl": os.getenv("WATSONX_API_URL"),
            "watsonxSdkUrl": _normalize_watsonx_url(os.getenv("WATSONX_API_URL")),
            "projectId": _mask_value(os.getenv("PROJECT_ID"), 6),
        }
    ), 200 if not missing else 503


@app.route("/api/ai", methods=["POST"])
def ai_completion():
    body = request.get_json(force=True, silent=True) or {}
    system_prompt = body.get("prompt", "You are a medical assistant.")
    user_input = body.get("input", "")

    if not system_prompt:
        return jsonify({"status": "error", "message": "Missing prompt"}), 400

    missing = _missing_watsonx_vars()
    if missing:
        return jsonify(
            {
                "status": "error",
                "message": "WatsonX is not configured on the backend.",
                "missingEnvVars": missing,
            }
        ), 503

    reference_document = _load_reference_document(body)
    final_prompt = _build_watsonx_prompt(system_prompt, user_input, reference_document)

    try:
        model = get_watsonx_model()
        generated_response = model.generate_text(prompt=final_prompt)
        parsed = _extract_json_from_text(generated_response)

        if reference_document and _count_document_backed_stages(parsed) < 2:
            retry_prompt = (
                final_prompt
                + "\n\nRevision requirement: Regenerate the JSON so that at least 2 stages are explicitly grounded in the retrieved vector-database context and marked with sourceBasis=\"document\". Reorganize stage boundaries if needed, but return only valid JSON."
            )
            generated_response = model.generate_text(prompt=retry_prompt)
            parsed = _extract_json_from_text(generated_response)

        if reference_document and _count_document_backed_stages(parsed) < 2:
            return jsonify(
                {
                    "status": "error",
                    "message": "WatsonX response did not include the required minimum of 2 vector-database-backed stages.",
                }
            ), 502

        return jsonify(
            {
                "status": "ok",
                "raw": generated_response,
                "parsed": parsed,
                "source": "watsonx",
                "documentContext": {
                    "loaded": bool(reference_document),
                    "name": reference_document["name"] if reference_document else None,
                    "source": reference_document["source"] if reference_document else None,
                    "truncated": reference_document["truncated"] if reference_document else False,
                },
            }
        )
    except Exception as exc:
        print(f"ERROR: {exc}")
        error_message = f"WatsonX request failed: {exc}"
        status_code = 502
        error_code = None

        if "token_quota_reached" in str(exc):
            status_code = 503
            error_code = "token_quota_reached"
            error_message = (
                "WatsonX rejected the request because the active credentials or project have no remaining token quota. "
                "Restart the backend so it reloads the latest .env values. If the error still happens after restart, "
                "the IBM Cloud project tied to the current credentials is out of quota."
            )
        elif "Provided API key could not be found" in str(exc):
            status_code = 503
            error_code = "invalid_api_key"
            error_message = (
                "WatsonX rejected the current API key. The backend is using the updated .env values, but IBM IAM says "
                "this API key could not be found. Replace WATSONX_API_KEY with a valid IBM Cloud API key and restart the backend."
            )

        return jsonify(
            {
                "status": "error",
                "message": error_message,
                "errorCode": error_code,
                "runtimeConfig": {
                    "watsonxApiUrl": os.getenv("WATSONX_API_URL"),
                    "watsonxSdkUrl": _normalize_watsonx_url(os.getenv("WATSONX_API_URL")),
                    "projectId": _mask_value(os.getenv("PROJECT_ID"), 6),
                },
            }
        ), status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)

