# To run this code you need to install the following dependencies:
# pip install google-genai fastapi uvicorn python-multipart Pillow langchain-core langchain-ollama

import base64
import os
import json
from typing import List, Optional, Dict, Any
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from PIL import Image, ImageDraw

# Import the google.generativeai library and its types module
from google import genai
from google.genai import types
from langchain_core.messages import HumanMessage
from langchain_ollama import ChatOllama

# The google-genai library automatically looks for GOOGLE_API_KEY/GEMINI_API_KEY in your environment variables.
# Before running, ensure you have set the API key in your terminal:
# export GOOGLE_API_KEY='Your-API-Key-Here'

app = FastAPI(title="VL Services")

# ----- Utility helpers -----
def pil_to_base64_jpeg(pil_image: Image.Image) -> str:
    """Convert a PIL image to base64-encoded JPEG string."""
    buf = BytesIO()
    pil_image.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def file_to_base64_jpeg(file_bytes: bytes) -> str:
    """Open raw bytes as PIL, then encode to base64 JPEG."""
    pil_image = Image.open(BytesIO(file_bytes)).convert("RGB")
    return pil_to_base64_jpeg(pil_image)

# Default prompt for the privacy audit
DEFAULT_PRIVACY_PROMPT = """
You are a privacy auditor for images.
Scan the uploaded photo carefully and identify any regions that may compromise the user's privacy or safety.
For EACH sensitive element found, return:
- "type": A label like "face", "license_plate", "house_number", "text", "credit_card", etc.
- "reason": A short explanation of why it may be sensitive.
- "box": Approximate bounding box in pixel coordinates [x_min, y_min, x_max, y_max].
Important rules:
- Return ONLY valid JSON.
- Do not include explanations outside of JSON.
- If no sensitive elements are found, return: { "sensitive_regions": [] }
""".strip()

# Initialize the VLM once
vlm = ChatOllama(model="qwen2.5vl:latest", temperature=0)

# ----- Routes -----
@app.get("/")
def read_root():
    return {"status": "online"}

@app.post("/vl/audit")
async def vl_privacy_audit(
    files: List[UploadFile] = File(..., description="One or more image files"),
    text: Optional[str] = Form(None, description="Optional prompt override/append")
) -> JSONResponse:
    """
    Accepts multipart/form-data to audit images for sensitive content.
    """
    results: Dict[str, Any] = {}
    prompt_text = DEFAULT_PRIVACY_PROMPT if not text else f"{DEFAULT_PRIVACY_PROMPT}\n\n{text}"

    for f in files:
        name = f.filename or "uploaded_image"
        try:
            raw = await f.read()
            img_b64 = file_to_base64_jpeg(raw)

            image_part = {"type": "image_url", "image_url": f"data:image/jpeg;base64,{img_b64}"}
            text_part = {"type": "text", "text": prompt_text}
            messages = [HumanMessage(content=[image_part, text_part])]

            response = vlm.invoke(messages)

            try:
                parsed_content = json.loads(response.content)
                results[name] = {"ok": True, "data": parsed_content}
            except json.JSONDecodeError:
                 results[name] = {
                    "ok": False,
                    "error": "Failed to parse JSON from the model's response.",
                    "raw": response.content
                }
        except Exception as e:
            results[name] = {"ok": False, "error": str(e)}

    return JSONResponse(results)


@app.post("/vl/edit_flash")
async def vl_edit_flash(
    file: UploadFile = File(..., description="The image file to be edited."),
    sensitive_regions: str = Form(..., description='A JSON string of sensitive regions to redact, from the /vl/audit endpoint.'),
    prompt: str = Form("Securely and seamlessly redact the information in the masked areas. Make it look natural and blend with the surroundings.")
):

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY or GOOGLE_API_KEY is not set in environment variables.")

    try:

        try:
            regions_data = json.loads(sensitive_regions)
            regions_list = regions_data.get("sensitive_regions", [])
            if not isinstance(regions_list, list):
                raise ValueError("The 'sensitive_regions' key must contain a list.")
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(status_code=400, detail=f"Invalid format for sensitive_regions JSON: {e}")

        image_bytes = await file.read()
        original_image = Image.open(BytesIO(image_bytes)).convert("RGB")


        if not regions_list:
            return StreamingResponse(BytesIO(image_bytes), media_type=file.content_type)

        mask = Image.new("L", original_image.size, 0)  
        drawer = ImageDraw.Draw(mask)
        for region in regions_list:
            box = region.get("box")
            if box and len(box) == 4:
                drawer.rectangle(box, fill=255) 

        client = genai.Client(api_key=api_key)
        model = "gemini-2.5-flash-image-preview"

        def pil_to_png_bytes(pil_img):
            byte_arr = BytesIO()
            pil_img.save(byte_arr, format='PNG')
            return byte_arr.getvalue()

        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                    types.Part.from_bytes(
                        mime_type="image/png",
                        data=pil_to_png_bytes(original_image)
                    ),
                    types.Part.from_bytes(
                        mime_type="image/png",
                        data=pil_to_png_bytes(mask)
                    )
                ]
            )
        ]
        
        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
        )

        async def response_stream_generator():
            """Streams the image data chunks from the Gemini API."""
            try:
                stream = client.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=generate_content_config,
                )
                for chunk in stream:
                    if (
                        chunk.candidates and chunk.candidates[0].content and
                        chunk.candidates[0].content.parts
                    ):
                        part = chunk.candidates[0].content.parts[0]
                        if part.inline_data and part.inline_data.data:
                            yield part.inline_data.data
            except Exception as e:
                print(f"Error during Gemini stream generation: {e}")

        return StreamingResponse(response_stream_generator(), media_type="image/png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)