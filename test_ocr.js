const { createWorker } = require('tesseract.js');
const fs = require('fs');

const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Please provide the path to the image file.');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`File not found: ${imagePath}`);
  process.exit(1);
}

const extractAmount = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const cleanedLines = lines.map((l) => l.replace(/\s+/g, " ").replace(/,/g, ""));

    // Improved regex for currency: handle number before or after currency
    const currencyRegex = /(?:₹|Rs|INR|USD|\$)\s*(\d{1,6}(?:\.\d{1,2})?)|(\d{1,6}(?:\.\d{1,2})?)\s*(?:₹|Rs|INR|USD|\$)/gi;
    const numberRegex = /\b(\d{1,6}(?:\.\d{1,2})?)\b/g;
    // Added more keywords
    const totalKeywords = /total|payable|due|grand total|final amount|bill amount|current charges|charges|bill total|energy charges|amount|balance|sum|net|subtotal|tax|invoice total|payment due|total due|to pay/i;

    const candidates = [];

    // Filter out lines that are likely to contain irrelevant numbers
    const isLikelyAmount = (line) => {
      const lowerLine = line.toLowerCase();
      if (/\b(phone|ph|mobile|mob|tel)\b/i.test(lowerLine)) return false;
      if (/\b(date|time)\b/i.test(lowerLine)) return false;
      if (/\d{5,}/.test(line.replace(/[\s.-]/g, ""))) { // Likely a zip code or phone number
        if (!currencyRegex.test(line) && !totalKeywords.test(line)) return false;
      }
      return true;
    };

    const filteredLines = cleanedLines.filter(isLikelyAmount);

    // 1️⃣ Lines with currency symbol (improved)
    for (let line of filteredLines) {
      let match;
      while ((match = currencyRegex.exec(line)) !== null) {
        const val = parseFloat(match[1] || match[2]);
        candidates.push({ value: val, line: line.toLowerCase(), currency: true, weight: 10 });
      }
    }

    // 2️⃣ Lines with total keywords (improved)
    filteredLines.forEach((line, i) => {
      if (totalKeywords.test(line)) {
        let match;
        while ((match = numberRegex.exec(line)) !== null) {
          const val = parseFloat(match[1]);
          if (val > 1) { // Lowered threshold from 10
            const keywordMatch = line.match(totalKeywords);
            const keywordIndex = keywordMatch ? keywordMatch.index : -1;
            const numberIndex = match.index;
            const distance = keywordIndex !== -1 ? Math.abs(keywordIndex - numberIndex) : Infinity;
            candidates.push({ value: val, line: line.toLowerCase(), keyword: true, weight: 5 / (distance + 1) });
          }
        }
      }
    });

    // 3️⃣ Fallback: largest number > 50 (lowered threshold)
    if (candidates.length === 0) {
      filteredLines.forEach((line) => {
        let match;
        while ((match = numberRegex.exec(line)) !== null) {
          const val = parseFloat(match[1]);
          if (val >= 50) candidates.push({ value: val, line: line.toLowerCase(), fallback: true, weight: 1 });
        }
      });
    }

    console.log("Amount candidates:", candidates); // Debug log

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        if (a.weight !== b.weight) return b.weight - a.weight;
        return b.value - a.value;
      });
      return candidates[0].value.toFixed(2).toString();
    }

    return "";
  };


(async () => {
  const worker = await createWorker('eng', { logger: null });
  const { data: { text } } = await worker.recognize(imagePath);
  console.log('--- OCR Result ---');
  console.log(text);
  console.log('------------------');
  const amount = extractAmount(text);
  console.log(`Extracted amount: ${amount}`);
  await worker.terminate();
})();
