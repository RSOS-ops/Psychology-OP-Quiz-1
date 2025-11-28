from pypdf import PdfReader
import re
import json

def extract_answer_key():
    reader = PdfReader("Psychology-OP_FullTextbook-compressed.pdf")
    start_page = 640
    text = ""
    for i in range(start_page, len(reader.pages)):
        text += reader.pages[i].extract_text() + "\n"

    match = re.search(r"Answer Key(.*)", text, re.DOTALL)
    if not match: return {}
    key_text = match.group(1)

    chapters = re.split(r'(Chapter\s+\d+)', key_text)
    answer_key = {}
    current_chapter = None

    for part in chapters:
        part = part.strip()
        if not part: continue
        if part.startswith("Chapter"):
            try:
                current_chapter = str(int(part.replace("Chapter", "").strip()))
                answer_key[current_chapter] = {}
            except: pass
        else:
            if current_chapter is not None:
                matches = re.findall(r'(\d+)\.\s+([a-d|A-D])', part)
                for q_num, ans in matches:
                    answer_key[current_chapter][int(q_num)] = ans.lower()
    return answer_key

if __name__ == "__main__":
    key = extract_answer_key()
    with open("answer_key.json", "w") as f:
        json.dump(key, f)
