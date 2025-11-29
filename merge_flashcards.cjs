const fs = require('fs');
const path = require('path');
const vm = require('vm');

const newFile = path.join(__dirname, 'FlashCards', 'NewFlashCards_FromFullTextbook.txt');
const oldFile = path.join(__dirname, 'FlashCards', 'old_flashcardData.js');
const outFile = path.join(__dirname, 'FlashCards', 'merged_flashcards.json');

function getDataFromFile(filePath, varName) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove any export statements to avoid syntax errors in simple VM
    content = content.replace(/export\s+const/g, 'const');
    content = content.replace(/export\s+default/g, '');
    
    // Change const to var so it attaches to the sandbox object
    // We use a regex to only replace the specific variable declaration we care about
    // or just replace all top-level consts.
    // Safer to just replace the specific one.
    content = content.replace(new RegExp(`const\\s+${varName}\\s*=`), `var ${varName} =`);
    
    const sandbox = {};
    vm.createContext(sandbox);
    try {
        vm.runInContext(content, sandbox);
        return sandbox[varName];
    } catch (e) {
        console.error(`Error parsing ${filePath}:`, e);
        return null;
    }
}

const newData = getDataFromFile(newFile, 'DECK_DATA');
const oldData = getDataFromFile(oldFile, 'rawStudyData');

if (!newData || !oldData) {
    console.error("Failed to load data.");
    process.exit(1);
}

const mergedData = {};

function normalize(text) {
    return text ? text.toLowerCase().trim().replace(/[^\w\s]/g, '') : '';
}

// Initialize with New Data
for (const key in newData) {
    const chapter = newData[key];
    mergedData[key] = {
        title: chapter.title,
        description: chapter.description || "",
        cards: chapter.cards.map(c => ({ front: c.front, back: c.back }))
    };
}

// Merge Old Data
for (const key in oldData) {
    const chapter = oldData[key];
    // Old data keys are "1", "2", etc. New data keys are "chapter1", "chapter2".
    const newKey = `chapter${key}`;
    
    if (!mergedData[newKey]) {
        mergedData[newKey] = {
            title: chapter.title,
            description: "",
            cards: []
        };
    }
    
    const targetChapter = mergedData[newKey];
    
    chapter.cards.forEach(oldCard => {
        const front = oldCard.term;
        const back = oldCard.definition;
        
        // Check for duplicates based on the 'front' (term)
        const isDuplicate = targetChapter.cards.some(existingCard => {
            return normalize(existingCard.front) === normalize(front);
        });
        
        if (!isDuplicate) {
            targetChapter.cards.push({ front, back });
        }
    });
}

fs.writeFileSync(outFile, JSON.stringify(mergedData, null, 2));
console.log("Merge complete. Output written to " + outFile);
