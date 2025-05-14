from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Union, List
import transformers
import torch
from functools import lru_cache
import re

app = FastAPI()

class GenerateRequest(BaseModel):
    message: Union[str, None] = Field(default=None, alias="prompt")
    prompt: Union[str, None] = None

    @property
    def input_text(self):
        return self.message or self.prompt

model_id = "ContactDoctor/Bio-Medical-Llama-3-2-1B-CoT-012025"

# Load the model and tokenizer
tokenizer = transformers.AutoTokenizer.from_pretrained(model_id)
model = transformers.AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    device_map="auto",
    low_cpu_mem_usage=True
)

# Create the pipeline
pipeline = transformers.pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    torch_dtype=torch.float16,
    device_map="auto",
)

# Medical keywords and phrases for filtering
MEDICAL_KEYWORDS = [
    "health", "disease", "treatment", "symptom", "syndrome", "diagnosis", "prognosis",
    "medical", "medicine", "doctor", "patient", "hospital", "clinic", "therapy",
    "cancer", "diabetes", "heart", "brain", "lung", "kidney", "liver", "blood",
    "surgery", "vaccine", "antibiotic", "infection", "virus", "bacteria", "parasite",
    "allergy", "chronic", "acute", "pain", "fever", "cough", "headache", "nausea",
    "prescription", "drug", "medication", "dose", "dosage", "pharmaceutical",
    "anatomy", "physiology", "pathology", "oncology", "cardiology", "neurology",
    "pediatrics", "gynecology", "psychiatry", "radiology", "dermatology",
    "emergency", "ICU", "nursing", "wellness", "nutrition", "diet", "exercise",
    "pregnancy", "birth", "genetic", "hereditary", "autoimmune", "immunity",
    "vaccination", "pandemic", "epidemic", "outbreak", "syndrome", "disorder",
    "insurance", "healthcare", "medical condition", "medical history", "medical record",
    "fracture", "injury", "wound", "burn", "poisoning", "overdose",
    "transplant", "dialysis", "chemotherapy", "radiation", "physical therapy",
    "mental health", "depression", "anxiety", "bipolar", "schizophrenia", "trauma"
]

# Non-medical topics to explicitly reject
NON_MEDICAL_CATEGORIES = [
    "politics", "entertainment", "celebrity", "sports", "weather", "news",
    "finance", "investment", "stock market", "cryptocurrency", "business",
    "travel", "vacation", "hotel", "flight", "tourism",
    "technology", "software", "hardware", "programming", "coding", "gaming",
    "education", "school", "university", "college", "degree", "course",
    "food recipe", "cooking", "baking", "restaurant", "cuisine",
    "religion", "philosophy", "ethics", "morality", 
    "art", "music", "movie", "film", "television", "show", "book",
    "history", "war", "civilization", "culture", "archaeology",
    "legal", "law", "lawsuit", "court", "judge", "attorney",
    "dating", "relationship", "marriage", "divorce",
    "job", "career", "employment", "resume", "interview",
    "real estate", "property", "housing", "mortgage", "rent"
]


# Sample medical resources by category that can be referenced
MEDICAL_RESOURCES = {
    "general": [
        {"name": "MedlinePlus", "url": "https://medlineplus.gov/"},
        {"name": "Mayo Clinic", "url": "https://www.mayoclinic.org/"},
    ],
    "heart": [
        {"name": "American Heart Association", "url": "https://www.heart.org/"},
    ],
    "diabetes": [
        {"name": "American Diabetes Association", "url": "https://www.diabetes.org/"},
    ],
    "cancer": [
        {"name": "National Cancer Institute", "url": "https://www.cancer.gov/"},
    ],
    "mental_health": [
        {"name": "National Institute of Mental Health", "url": "https://www.nimh.nih.gov/"},
    ],
    "nutrition": [
        {"name": "Harvard Nutrition Source", "url": "https://www.hsph.harvard.edu/nutritionsource/"},
    ],
    "pregnancy": [
        {"name": "American Pregnancy Association", "url": "https://americanpregnancy.org/"},
    ],
    "pediatrics": [
        {"name": "American Academy of Pediatrics", "url": "https://www.aap.org/"},
    ],
}

def append_relevant_resources(query: str, response: str) -> str:
    """
    Append relevant medical resource URLs to the model's response.
    """
    # Combine query and response for better category matching
    combined_text = (query + " " + response).lower()
    
    # Identify relevant categories
    relevant_categories = ["general"]  # Always include general resources
    
    for category in MEDICAL_RESOURCES.keys():
        if category in combined_text:
            relevant_categories.append(category)
    
    # Limit to max 2 categories
    if len(relevant_categories) > 2:
        relevant_categories = relevant_categories[:2]
    
    # Select resources from relevant categories
    selected_resources = []
    for category in relevant_categories:
        # Select 1 resource from each category
        resources = MEDICAL_RESOURCES.get(category, [])
        if resources:
            selected_resources.append(resources[0])
    
    # Limit to max 2 resources total
    selected_resources = selected_resources[:2]
    
    # Append resources to the response
    if selected_resources:
        enhanced_response = response.strip() + "\n\nSources:\n"
        for i, resource in enumerate(selected_resources):
            enhanced_response += f"{i+1}. {resource['name']}: {resource['url']}\n"
        
        return enhanced_response
    
    return response

def format_concise_response(response: str) -> str:
    """
    Format the model's response to be concise and structured as Yes/No with brief explanation.
    """
    # Remove common verbose elements
    response = re.sub(r"I'm not comfortable providing information on.*?\.", "", response)
    response = re.sub(r"I want to ensure I provide accurate.*?\.", "", response)
    response = re.sub(r"This is a complex topic.*?\.", "", response)
    response = re.sub(r"I need to be cautious.*?\.", "", response)
    
    # Try to extract a yes/no answer
    yes_patterns = [r'\byes\b', r'\bcorrect\b', r'\btrue\b', r'\baffirmative\b', r'\bdefinitely\b', r'\baccurate\b']
    no_patterns = [r'\bno\b', r'\bincorrect\b', r'\bfalse\b', r'\bnegative\b', r'\bdefinitely not\b', r'\binaccurate\b']
    
    has_yes = any(re.search(pattern, response.lower()) for pattern in yes_patterns)
    has_no = any(re.search(pattern, response.lower()) for pattern in no_patterns)
    
    # Format the response
    stripped_response = re.sub(r'\s+', ' ', response).strip()
    
    # If we can determine a yes/no answer
    if has_yes and not has_no:
        # Extract a concise explanation
        explanation = stripped_response
        # Remove lists and numbered points
        explanation = re.sub(r'\d+\.\s*\*\*.*?\*\*:.*?(?=\d+\.\s*\*\*|$)', '', explanation)
        explanation = re.sub(r'\*\*.*?\*\*', '', explanation)
        explanation = re.sub(r'\n+', ' ', explanation)
        explanation = re.sub(r'\s+', ' ', explanation)
        
        # Limit to ~100 words
        words = explanation.split()
        if len(words) > 100:
            explanation = ' '.join(words[:100]) + '...'
            
        return f"Yes. {explanation.strip()}"
        
    elif has_no and not has_yes:
        # Extract a concise explanation
        explanation = stripped_response
        # Remove lists and numbered points
        explanation = re.sub(r'\d+\.\s*\*\*.*?\*\*:.*?(?=\d+\.\s*\*\*|$)', '', explanation)
        explanation = re.sub(r'\*\*.*?\*\*', '', explanation)
        explanation = re.sub(r'\n+', ' ', explanation)
        explanation = re.sub(r'\s+', ' ', explanation)
        
        # Limit to ~100 words
        words = explanation.split()
        if len(words) > 100:
            explanation = ' '.join(words[:100]) + '...'
            
        return f"No. {explanation.strip()}"
        
    else:
        # If we can't determine a yes/no, simplify the response
        # Remove lists and numbered points
        simplified = re.sub(r'\d+\.\s*\*\*.*?\*\*:.*?(?=\d+\.\s*\*\*|$)', '', stripped_response)
        simplified = re.sub(r'\*\*.*?\*\*', '', simplified)
        simplified = re.sub(r'\n+', ' ', simplified)
        simplified = re.sub(r'\s+', ' ', simplified)
        
        # Limit to ~100 words
        words = simplified.split()
        if len(words) > 100:
            simplified = ' '.join(words[:100]) + '...'
            
        return simplified.strip()

# Cache for the generate function
@lru_cache(maxsize=100)
def generate_cached(prompt):
    terminators = [
        tokenizer.eos_token_id,
        tokenizer.convert_tokens_to_ids("<|eot_id|>")
    ]
    
    with torch.inference_mode():
        outputs = pipeline(
            prompt,
            max_new_tokens=256,
            eos_token_id=terminators,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
        )
    
    return outputs[0]["generated_text"][len(prompt):]

@app.post("/generate")
async def generate_response(request: GenerateRequest):
    if not request.input_text:
        raise HTTPException(status_code=400, detail="Input text must be provided")
    
    try:
        # Structure that forces the model to analyze first
        messages = [
            {
                "role": "system",
                "content": (
                    "You are a medical assistant. Only return medical prompt with 'Yes' or 'No' + a brief medical justification.if the topic is not medical return i am sorry"
                )
            },
            {"role": "user", "content": request.input_text}
        ]

        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )

        response = generate_cached(prompt)
        cleaned_response = re.sub(r'\s+', ' ', response.strip())
        
        # Final validation without keyword checks
        if not cleaned_response.startswith(('Yes', 'No')):
            if "i only answer medical" not in cleaned_response.lower():
                cleaned_response = "I only answer medical questions related to health or medicine."
        
        return {"response": cleaned_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)