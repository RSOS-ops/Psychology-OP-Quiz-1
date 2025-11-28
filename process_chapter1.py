
import re
import json
from pypdf import PdfReader

# --- Configuration ---
CHAPTER_PDF = "Chapter_01_ReviewFromTextbook.pdf"
FULL_TEXTBOOK_PDF = "Psychology-OP_FullTextbook-compressed.pdf"
OUTPUT_JS = "Chapter-1-flashcards.js"
OUTPUT_JSON = "Chapter-1-Summary.json"

# Manually mapped terms for Chapter 1 due to messy PDF text extraction (columnar layout flattening)
# In a generalized solution, we would need a layout-aware PDF parser.
CHAPTER_1_TERMS = [
    "American Psychological Association", "behaviorism", "biopsychology", "biopsychosocial model",
    "clinical psychology", "cognitive psychology", "counseling psychology", "developmental psychology",
    "dissertation", "empirical method", "forensic psychology", "functionalism", "humanism",
    "introspection", "ology", "personality psychology", "personality trait", "PhD",
    "postdoctoral training program", "psyche", "psychoanalytic theory", "psychology",
    "PsyD", "sport and exercise psychology", "structuralism"
]

# Answer Key for Chapter 1 (Odd from Text, Even derived from Text)
CHAPTER_1_ANSWERS = {
    1: 'd', 2: 'b', 3: 'c', 4: 'd', 5: 'b', 6: 'c', 7: 'd', 8: 'a',
    9: 'a', 10: 'c', 11: 'b', 12: 'd', 13: 'd', 14: 'b', 15: 'd', 16: 'c'
}

def extract_text_from_pdf(filepath):
    reader = PdfReader(filepath)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def parse_key_terms(text):
    """
    Parses key terms from the text.
    Note: Requires known term list for Chapter 1 because definitions are separated from terms in the extracted stream.
    """
    # Locate the section containing Key Terms definitions.
    # For Chapter 1, they appear after the list of terms and the "Key Terms" header,
    # and before "Summary".

    # Extract the block of text that contains the definitions
    # Heuristic: Find the segment between "Key Terms" and "Summary"
    match = re.search(r"Key Terms(.*?)Summary", text, re.DOTALL)
    if not match:
        # Fallback if "Key Terms" string is missing or moved
        return []

    content = match.group(1)

    # Clean up content
    lines = [l.strip() for l in content.split('\n') if l.strip()]
    # Remove page headers
    lines = [l for l in lines if not l.startswith("30 Chapter 1") and not l.startswith("This OpenStax book") and not l.startswith("Chapter 1 |") and not l.startswith("---PAGE---")]

    # Manually map lines to terms based on known order for Chapter 1.
    # This is necessary because of the PDF extraction artifacts.
    # We construct the definitions list.

    # Based on previous analysis of the file structure:
    definitions_map = []

    # 0-1
    definitions_map.append(lines[0] + " " + lines[1])
    # 2
    definitions_map.append(lines[2])
    # 3
    definitions_map.append(lines[3])
    # 4-5
    definitions_map.append(lines[4] + " " + lines[5])
    # 6-7
    definitions_map.append(lines[6] + " " + lines[7])
    # 8
    definitions_map.append(lines[8])
    # 9-10
    definitions_map.append(lines[9] + " " + lines[10])
    # 11
    definitions_map.append(lines[11])
    # 12-13
    definitions_map.append(lines[12] + " " + lines[13])
    # 14-15
    definitions_map.append(lines[14] + " " + lines[15])
    # 16-17
    definitions_map.append(lines[16] + " " + lines[17])
    # 18
    definitions_map.append(lines[18])
    # 19-20
    definitions_map.append(lines[19] + " " + lines[20])
    # 21-22
    definitions_map.append(lines[21] + " " + lines[22])
    # 23
    definitions_map.append(lines[23])
    # 24
    definitions_map.append(lines[24])
    # 25
    definitions_map.append(lines[25])
    # 26-27
    definitions_map.append(lines[26] + " " + lines[27])
    # 28-29
    definitions_map.append(lines[28] + " " + lines[29])
    # 30
    definitions_map.append(lines[30])
    # 31
    definitions_map.append(lines[31])
    # 32
    definitions_map.append(lines[32])

    # The last 3 terms (PsyD, sport..., structuralism) appear as TERMS in the lines list (indices 33, 34, 35 in 0-indexed raw list,
    # but here lines list includes them).
    # Lines 33, 34, 35 are the terms themselves.
    # Lines 36+ are their definitions.

    definitions_map.append(lines[36] + " " + lines[37]) # PsyD
    definitions_map.append(lines[38] + " " + lines[39]) # Sport
    definitions_map.append(lines[40]) # Structuralism

    cards = []
    for i, term in enumerate(CHAPTER_1_TERMS):
        if i < len(definitions_map):
            cards.append({
                "term": term,
                "definition": definitions_map[i]
            })

    return cards

def parse_summary(text):
    summary_match = re.search(r"Summary(.*?)(Review Questions)", text, re.DOTALL)
    if summary_match:
        s = summary_match.group(1)
        s = s.replace("\n", " ").replace("- ", "")
        s = re.sub(r'\s+', ' ', s).strip()
        # Clean specific artifacts
        s = s.replace("Chapter 1 | Introduction to Psychology 31", "").replace("This OpenStax book is available for free at https://cnx.org/content/col11629/1.5", "")
        s = re.sub(r'\s+', ' ', s).strip()
        return s
    return ""

def parse_review_questions(text):
    match = re.search(r"Review Questions(.*?)Critical Thinking Questions", text, re.DOTALL)
    if not match:
        return []

    content_raw = match.group(1)

    # Clean content
    lines = content_raw.split('\n')
    clean_lines = []
    for l in lines:
        l = l.strip()
        if not l: continue
        if l.startswith("32 Chapter 1") or l.startswith("This OpenStax book") or l.startswith("Chapter 1 |") or l.startswith("---PAGE---"):
            continue
        clean_lines.append(l)

    full_text = " ".join(clean_lines)

    # Split by "1. ", "2. " using regex
    parts = re.split(r'(?<!\d)(\d+\.\s)', full_text)

    questions = []
    i = 1
    while i < len(parts):
        num_str = parts[i].strip().replace('.', '')
        q_text_blob = parts[i+1]

        # Split options (a. b. c. d.)
        opt_parts = re.split(r'\s([a-d]\.\s)', q_text_blob)

        question_text = opt_parts[0].strip()
        options = {}

        j = 1
        while j < len(opt_parts):
            marker = opt_parts[j].strip().replace('.', '')
            val = opt_parts[j+1].strip()
            options[marker] = val
            j += 2

        questions.append({
            "number": int(num_str),
            "question": question_text,
            "options": options
        })

        i += 2

    return questions

def generate_output_files():
    text = extract_text_from_pdf(CHAPTER_PDF)

    # 1. Parse Data
    key_terms = parse_key_terms(text)
    summary = parse_summary(text)
    questions = parse_review_questions(text)

    # 2. Build Flashcards JS
    current_id = 101

    js_content = "const flashcards = {\n"
    js_content += '    "1": {\n'
    js_content += '        title: "Introduction to Psychology",\n'
    js_content += '        cards: [\n'

    # Key Terms
    for item in key_terms:
        js_content += f'            {{ id: {current_id}, term: "{item["term"]}", definition: "{item["definition"]}" }},\n'
        current_id += 1

    js_content += '            //Review Questions\n'

    # Review Questions
    for q in questions:
        ans_key = CHAPTER_1_ANSWERS.get(q['number'])
        ans_text = q['options'].get(ans_key, "Unknown")

        js_content += f'            {{ id: {current_id}, term: "{q["question"]}", definition: "{ans_text}" }},\n'
        current_id += 1

    js_content += '        ]\n'
    js_content += '    }\n'
    js_content += '};\n'

    with open(OUTPUT_JS, "w") as f:
        f.write(js_content)

    # 3. Build Summary JSON
    with open(OUTPUT_JSON, "w") as f:
        json.dump({"summary": summary}, f, indent=4)

if __name__ == "__main__":
    generate_output_files()
