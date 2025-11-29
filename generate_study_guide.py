import os
import re
import json
import PyPDF2
from difflib import SequenceMatcher

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_DIR = os.path.join(BASE_DIR, 'public', 'QuizQuestionsByChapters')
TEXTBOOK_PATH = os.path.join(BASE_DIR, 'public', 'Textbook', 'Psychology-OP_FullTextbook-compressed.pdf')
OUTPUT_FILE = os.path.join(BASE_DIR, 'public', 'study_guide_pointers.json')

def parse_js_file(file_path):
    """
    Extracts the JSON-like array from the JS file.
    Assumes the format: const variableName = [...];
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find the array content
    # Looking for [ ... ] pattern. 
    # This is a simple extraction and might need robustness for complex JS.
    match = re.search(r'=\s*(\[.*\])', content, re.DOTALL)
    if match:
        json_str = match.group(1)
        # Remove trailing semicolon if present
        if json_str.strip().endswith(';'):
            json_str = json_str.strip()[:-1]
        
        # JS objects might use single quotes or unquoted keys. 
        # We need to convert to valid JSON for json.loads
        # 1. Quote unquoted keys (simple heuristic)
        # json_str = re.sub(r'(\w+):', r'"\1":', json_str) # Too risky if text contains colons
        # 2. Convert single quotes to double quotes, escaping existing double quotes?
        # This is tricky. Let's try a safer approach: `ast.literal_eval` if it was python, 
        # but it's JS.
        
        # Let's try to clean it up to be valid JSON
        # The example showed valid JSON keys "q": "...", "a": [...]
        # So maybe just replacing ' with " is enough if they use single quotes?
        # The example used double quotes. So json.loads might just work.
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # Fallback: try to fix common JS-to-JSON issues
            # Replace single quotes with double quotes (carefully)
            # This is a best-effort parser for this specific project structure
            try:
                # Remove comments if any
                json_str = re.sub(r'//.*', '', json_str)
                return json.loads(json_str)
            except:
                print(f"Warning: Could not parse {file_path}")
                return []
    return []

def extract_text_from_pdf(pdf_path):
    """
    Generator that yields (page_number, text) from the PDF.
    """
    if not os.path.exists(pdf_path):
        print(f"Error: Textbook not found at {pdf_path}")
        return

    try:
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                yield i + 1, text # 1-based page number
    except Exception as e:
        print(f"Error reading PDF: {e}")

def normalize_text(text):
    """
    Normalize text for searching (lowercase, remove punctuation).
    """
    return re.sub(r'[^\w\s]', '', text.lower())

def find_best_match(question, pdf_pages):
    """
    Finds the best matching page for a question.
    Returns page number or None.
    """
    q_text = normalize_text(question['q'])
    
    # Find correct answer text
    correct_answer = next((a['t'] for a in question['a'] if a['c']), "")
    a_text = normalize_text(correct_answer)
    
    best_page = None
    max_score = 0
    
    # Heuristic: Search for the question text first.
    # If the question is found, that's a strong signal.
    # If not, look for the answer text in context.
    
    for page_num, page_text in pdf_pages:
        norm_page_text = normalize_text(page_text)
        
        # Simple containment check
        score = 0
        if q_text in norm_page_text:
            score += 10
        if a_text in norm_page_text and len(a_text) > 5: # Avoid short answers matching everywhere
            score += 5
            
        # If we want more fuzzy matching, we could use SequenceMatcher
        # but that is slow for a whole textbook.
        # Let's stick to containment for now.
        
        if score > max_score:
            max_score = score
            best_page = page_num
            
    return best_page if max_score > 0 else None

def main():
    print("Starting Study Guide Generator...")
    
    # 1. Load all questions
    all_questions = []
    for root, dirs, files in os.walk(QUESTIONS_DIR):
        for file in files:
            if file.endswith('.js'):
                path = os.path.join(root, file)
                print(f"Loading questions from {file}...")
                questions = parse_js_file(path)
                for q in questions:
                    # Add metadata to identify the question later
                    q['_source_file'] = file
                    all_questions.append(q)
    
    print(f"Loaded {len(all_questions)} questions.")
    
    # 2. Read PDF (Cache it in memory for speed if it fits, or iterate for each question?)
    # Iterating PDF for every question is O(N*M). 
    # Better to iterate PDF once and check all questions? 
    # Or build an index?
    # Given the scale, let's build a simple inverted index or just cache the pages.
    
    print("Reading Textbook...")
    pages = list(extract_text_from_pdf(TEXTBOOK_PATH))
    print(f"Read {len(pages)} pages.")
    
    # 3. Search
    print("Mapping questions to pages...")
    results = {}
    
    # Optimization: Pre-process pages
    processed_pages = [(p_num, normalize_text(text)) for p_num, text in pages]
    
    for i, q in enumerate(all_questions):
        if i % 10 == 0:
            print(f"Processing question {i+1}/{len(all_questions)}...")
            
        q_text = normalize_text(q['q'])
        correct_answer = next((a['t'] for a in q['a'] if a['c']), "")
        a_text = normalize_text(correct_answer)
        
        best_page = None
        # We want the *best* match.
        # Let's try to find the question text.
        
        # Strategy:
        # 1. Exact phrase match of question
        # 2. Exact phrase match of answer
        # 3. Keyword overlap
        
        # For this script, let's keep it simple:
        # If question text is found, use that page.
        # If not, try finding the answer text.
        
        found = False
        for p_num, p_text in processed_pages:
            if q_text in p_text:
                best_page = p_num
                found = True
                break # Stop at first match? Or find best? Usually first match is fine for unique questions.
        
        if not found and len(a_text) > 10: # Only search answer if it's substantial
             for p_num, p_text in processed_pages:
                if a_text in p_text:
                    best_page = p_num
                    found = True
                    break
        
        if best_page:
            # Create a unique key for the question. 
            # Using the question text itself is usually good enough.
            results[q['q']] = {
                "page": best_page,
                "chapter": q.get('_source_file', 'unknown')
            }
            
    # 4. Save results
    print(f"Found matches for {len(results)} questions.")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"Saved pointers to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
