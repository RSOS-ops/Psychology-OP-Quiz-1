const fs = require('fs');
const path = require('path');

const textbookPath = 'FlashCards/NewFlashCards_FromFullTextbook.txt';
const newFlashcardsDir = 'public/NewFlashcards_FromJules/Psychology-OP-Quiz-1-flashcard-parsing-final-fix/Psychology-OP-Quiz-1-flashcard-parsing-final-fix';

function parseTextbookFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const chapters = {};
    
    // Regex to find chapters like "chapter1: {"
    const chapterRegex = /chapter(\d+):\s*{[^}]*title:[^}]*cards:\s*\[([\s\S]*?)\]/g;
    let match;
    
    while ((match = chapterRegex.exec(content)) !== null) {
        const chapterNum = match[1];
        const cardsContent = match[2];
        
        // Split by "// Review Questions" if it exists
        const parts = cardsContent.split(/\/\/\s*Review Questions/i);
        if (parts.length > 1) {
            const reviewCardsStr = parts[1];
            const questions = extractCards(reviewCardsStr, 'front', 'back');
            chapters[chapterNum] = questions;
        } else {
            chapters[chapterNum] = [];
        }
    }
    return chapters;
}

function parseNewFlashcardFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Regex to find cards array
    const cardsRegex = /cards:\s*\[([\s\S]*?)\]/;
    const match = cardsRegex.exec(content);
    if (!match) return [];
    
    const cardsContent = match[1];
    // Split by "//Review Questions"
    const parts = cardsContent.split(/\/\/\s*Review Questions/i);
    if (parts.length > 1) {
        const reviewCardsStr = parts[1];
        return extractCards(reviewCardsStr, 'term', 'definition');
    }
    return [];
}

function extractCards(content, termKey, defKey) {
    const cards = [];
    // Regex to match objects like { key: "val", key2: "val" }
    // This is a simple parser and might be brittle if the JS is complex
    // We assume keys are unquoted or quoted, values are quoted strings.
    
    const objectRegex = /{\s*(\w+):\s*([^,]+),\s*(\w+):\s*(".*?"|'.*?')\s*(?:,\s*(\w+):\s*(".*?"|'.*?')\s*)?}/g;
    // Actually, let's try to match individual objects more loosely
    
    let depth = 0;
    let currentObj = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        
        if (inString) {
            currentObj += char;
            if (char === stringChar && content[i-1] !== '\\') {
                inString = false;
            }
        } else {
            if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
                currentObj += char;
            } else if (char === '{') {
                depth++;
                currentObj += char;
            } else if (char === '}') {
                depth--;
                currentObj += char;
                if (depth === 0 && currentObj.trim().length > 0) {
                    // Parse the object string
                    try {
                        // Convert to valid JSON if possible, or use regex to extract fields
                        const termMatch = new RegExp(`${termKey}:\\s*(["'])(.*?)\\1`).exec(currentObj);
                        const defMatch = new RegExp(`${defKey}:\\s*(["'])(.*?)\\1`).exec(currentObj);
                        
                        if (termMatch && defMatch) {
                            cards.push({
                                question: termMatch[2],
                                answer: defMatch[2]
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing card:", currentObj);
                    }
                    currentObj = '';
                }
            } else if (depth > 0) {
                currentObj += char;
            }
        }
    }
    return cards;
}

function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function compare() {
    const textbookChapters = parseTextbookFile(textbookPath);
    const report = [];
    
    // Get all chapter files
    const files = fs.readdirSync(newFlashcardsDir).filter(f => f.match(/Chapter-\d+-flashcards\.js/));
    
    files.forEach(file => {
        const chapterNumMatch = file.match(/Chapter-(\d+)-flashcards\.js/);
        if (!chapterNumMatch) return;
        const chapterNum = chapterNumMatch[1];
        
        const newQuestions = parseNewFlashcardFile(path.join(newFlashcardsDir, file));
        const oldQuestions = textbookChapters[chapterNum] || [];
        
        report.push(`\n--- Chapter ${chapterNum} ---`);
        report.push(`Textbook Questions: ${oldQuestions.length}`);
        report.push(`New File Questions: ${newQuestions.length}`);
        
        if (oldQuestions.length === 0 && newQuestions.length === 0) {
            report.push("No review questions found in either source.");
            return;
        }

        // Create maps for easy lookup
        const oldMap = new Map();
        oldQuestions.forEach(q => oldMap.set(normalize(q.question), q));
        
        const newMap = new Map();
        newQuestions.forEach(q => newMap.set(normalize(q.question), q));
        
        // Compare
        newQuestions.forEach(newQ => {
            const normQ = normalize(newQ.question);
            const oldQ = oldMap.get(normQ);
            
            if (oldQ) {
                // Question exists in both
                if (normalize(newQ.answer) !== normalize(oldQ.answer)) {
                    report.push(`\n[DIFFERENT ANSWER] Question: "${newQ.question}"`);
                    report.push(`  Old Answer: "${oldQ.answer}"`);
                    report.push(`  New Answer: "${newQ.answer}"`);
                }
                oldMap.delete(normQ); // Mark as matched
            } else {
                report.push(`\n[NEW QUESTION ONLY] "${newQ.question}"`);
                report.push(`  Answer: "${newQ.answer}"`);
            }
        });
        
        // Remaining old questions
        oldMap.forEach((oldQ) => {
            report.push(`\n[OLD QUESTION ONLY] "${oldQ.question}"`);
            report.push(`  Answer: "${oldQ.answer}"`);
        });
    });
    
    console.log(report.join('\n'));
}

compare();
