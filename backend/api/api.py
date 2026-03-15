import os
import json
import re
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# IBM WatsonX Imports
from ibm_watsonx_ai import Credentials
from ibm_watsonx_ai.foundation_models import ModelInference

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- UTILITY FUNCTIONS ---

def _extract_json_from_text(text: str):
    """Cleans the AI string to find JSON coordinates/arrays."""
    if not isinstance(text, str):
        return text
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        # Look for the first '[' or '{' to isolate the JSON block
        match = re.search(r'(\{.*\}|\[.*\])', text, re.S)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
    return text

def get_watsonx_model():
    """Initializes the WatsonX Model Inference client."""
    credentials = Credentials(
        url=os.getenv("WATSONX_API_URL"),
        api_key=os.getenv("WATSONX_API_KEY")
    )
    project_id = os.getenv("PROJECT_ID")
    
    # Using Llama-3-70b as a reliable model for JSON formatting
    model_id = "meta-llama/llama-3-70b-instruct" 
    
    parameters = {
        "decoding_method": "greedy",
        "max_new_tokens": 900,
        "temperature": 0
    }

    return ModelInference(
        model_id=model_id,
        params=parameters,
        credentials=credentials,
        project_id=project_id
    )

# --- ROUTES ---
@app.route('/api/ai', methods=['POST'])
def ai_completion():
    """
    Expects JSON body: { "prompt": "...", "input": "..." }
    """
    body = request.get_json(force=True, silent=True) or {}
    system_prompt = body.get("prompt", "You are a medical assistant.")
    user_input = body.get("input", "")

    if not system_prompt:
        return jsonify({"status": "error", "message": "Missing prompt"}), 400

    # Combine for a standard instruction format
    final_prompt = f"{system_prompt}\n\nInput: {user_input}\nOutput:"

    try:
        # Initialize and call the model
        model = get_watsonx_model()
        generated_response = model.generate_text(prompt=final_prompt)
        
        # Parse out any JSON (like your coordinate lists)
        parsed = _extract_json_from_text(generated_response)

        return jsonify({
            "status": "ok",
            "raw": generated_response,
            "parsed": parsed
        })
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)