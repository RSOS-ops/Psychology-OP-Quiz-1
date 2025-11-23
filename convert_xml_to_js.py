import xml.etree.ElementTree as ET
import json
import os
import re

def strip_html(text):
    """Remove HTML tags and decode CDATA"""
    if not text:
        return ""
    # Remove CDATA wrapper
    text = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', text, flags=re.DOTALL)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities
    text = text.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    text = text.replace('&quot;', '"').replace('&#39;', "'")
    return text.strip()

def parse_question_xml(xml_file):
    """Parse the XML question database and extract questions"""
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    questions = []
    
    # Find all item elements (questions)
    for item in root.findall('.//item'):
        # Get question text
        question_text_elem = item.find('.//presentation/flow/material/mattext')
        if question_text_elem is None:
            continue
        
        question_text = strip_html(question_text_elem.text)
        
        # Get all answer choices
        answers = []
        answer_labels = item.findall('.//response_lid/render_choice/flow_label/response_label')
        
        for label in answer_labels:
            answer_id = label.get('ident')
            answer_text_elem = label.find('.//mattext')
            if answer_text_elem is not None:
                answer_text = strip_html(answer_text_elem.text)
                
                # Check if this is the correct answer by finding respcondition with this answer_id
                is_correct = False
                for respcond in item.findall('.//respcondition'):
                    varequal = respcond.find('.//conditionvar/varequal')
                    if varequal is not None and varequal.text == answer_id:
                        setvar = respcond.find('.//setvar')
                        if setvar is not None and float(setvar.text) > 0:
                            is_correct = True
                            break
                
                answers.append({
                    't': answer_text,
                    'c': is_correct
                })
        
        if question_text and len(answers) > 0:
            questions.append({
                'q': question_text,
                'a': answers
            })
    
    return questions

def generate_js_file(questions, chapter_num, output_file):
    """Generate a JavaScript file with the questions"""
    js_content = f"// Chapter {chapter_num} Questions\n"
    js_content += f"const chapter{chapter_num}Questions = "
    js_content += json.dumps(questions, indent=2, ensure_ascii=False)
    js_content += ";\n"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Generated {output_file} with {len(questions)} questions")

def main():
    base_dir = "Chapters"
    
    # Chapter mapping (folder names to chapter numbers)
    chapters = {
        'Chp-1': 1,
        'Chp-2': 2,
        'Chp-3': 3,
        'Chp-4': 4,
        'Chp-5': 5,
        'Chp-6': 6,
        'Chp-7': 7,
        'Chp-8': 8,
        'Chp-9': 9,
        'Chp-10': 10,
        'Chp-11': 11,
        'Chp-14': 14,
        'Chp-15': 15,
        'Chp-16': 16
    }
    
    for folder, chapter_num in chapters.items():
        chapter_path = os.path.join(base_dir, folder)
        
        # Find the questiondb XML file
        xml_file = None
        for root, dirs, files in os.walk(chapter_path):
            for file in files:
                if 'questiondb' in file.lower() and file.endswith('.xml'):
                    xml_file = os.path.join(root, file)
                    break
            if xml_file:
                break
        
        if xml_file and os.path.exists(xml_file):
            print(f"Processing {xml_file}...")
            questions = parse_question_xml(xml_file)
            
            # Generate JS file
            output_file = f"chapter{chapter_num}.js"
            generate_js_file(questions, chapter_num, output_file)
        else:
            print(f"Warning: No questiondb XML found for {folder}")

if __name__ == "__main__":
    main()
