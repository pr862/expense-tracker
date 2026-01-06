// import React, { useState, useEffect } from 'react';
// import { createWorker } from 'tesseract.js';
// import '../../styles/BillScanner.css';

// const BillScanner = ({ onScan, onClose }) => {
//   const [scanning, setScanning] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [error, setError] = useState(null);
//   const [file, setFile] = useState(null);

//   // Category mapping based on merchant name keywords
//   const getCategoryFromMerchant = (merchantName) => {
//     const name = merchantName.toLowerCase();
//     if (name.includes('swiggy') || name.includes('zomato') || name.includes('food') || name.includes('restaurant') || name.includes('cafe') || name.includes('pizza') || name.includes('burger')) {
//       return 'food';
//     } else if (name.includes('amazon') || name.includes('flipkart') || name.includes('shopping') || name.includes('store') || name.includes('mart') || name.includes('mall')) {
//       return 'shopping';
//     } else if (name.includes('uber') || name.includes('ola') || name.includes('taxi') || name.includes('transport') || name.includes('auto') || name.includes('cab')) {
//       return 'transport';
//     } else if (name.includes('netflix') || name.includes('prime') || name.includes('entertainment') || name.includes('movie') || name.includes('cinema')) {
//       return 'entertainment';
//     } else if (name.includes('recharge') || name.includes('mobile') || name.includes('bill') || name.includes('electricity') || name.includes('water') || name.includes('gas')) {
//       return 'utilities';
//     } else if (name.includes('medical') || name.includes('hospital') || name.includes('pharmacy') || name.includes('doctor')) {
//       return 'healthcare';
//     } else {
//       return 'other'; // Default category
//     }
//   };

//   // Parse OCR text to extract expense details
//   const parseReceiptText = (text) => {
//     const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
//     let merchantName = 'Unknown Merchant';
//     let amount = '';
//     let date = '';
//     let note = '';

//     // Extract merchant name (usually first line or prominent text)
//     for (const line of lines) {
//       if (line.length > 3 && !line.match(/^\d/) && !line.includes('$') && !line.includes('₹') && !line.includes('Rs') && !line.includes('INR')) {
//         merchantName = line.replace(/[^a-zA-Z\s&-]/g, '').trim();
//         if (merchantName.length > 2) break;
//       }
//     }

//     // Extract amount (prioritize totals over subtotals and individual items)
//     let extractedAmount = null;

//     // First, try to find "grand total" with flexible matching for OCR errors (e.g., 'x73')
//     const grandTotalPattern = /grand total[:\s]*[^ \d]*(\d+(?:\.\d{2})?)/gi;
//     const grandTotalMatch = text.match(grandTotalPattern);
//     if (grandTotalMatch) {
//       const numMatch = grandTotalMatch[grandTotalMatch.length - 1].match(/(\d+(?:\.\d{2})?)/);
//       if (numMatch) {
//         extractedAmount = parseFloat(numMatch[1]);
//       }
//     }

//     // If no grand total, find all "total" but exclude "subtotal", take the last one
//     if (!extractedAmount) {
//       // Add more total patterns including "net amount", capturing numbers after the word
//       const totalPatterns = [
//         /net amount[:\s]*[^ \d]*(\d+(?:\.\d{2})?)/gi,
//         /master amount[:\s]*[^ \d]*(\d+(?:\.\d{2})?)/gi,
//         /total[:\s]*[^ \d]*(\d+(?:\.\d{2})?)/gi
//       ];

//       for (const pattern of totalPatterns) {
//         const matches = text.match(pattern);
//         if (matches) {
//           // Filter out subtotals and item totals
//           const filteredMatches = matches.filter(match => {
//             const before = text.substring(Math.max(0, text.indexOf(match) - 20), text.indexOf(match)).toLowerCase();
//             return !before.includes('sub') && !before.includes('item');
//           });
//           if (filteredMatches.length > 0) {
//             const numMatch = filteredMatches[filteredMatches.length - 1].match(/(\d+(?:\.\d{2})?)/);
//             if (numMatch) {
//               extractedAmount = parseFloat(numMatch[1]);
//               break;
//             }
//           }
//         }
//       }
//     }

//     // If still no total, find all potential money amounts (prefer with decimals or currency) and take the largest reasonable one
//     if (!extractedAmount) {
//       const moneyPatterns = [
//         /₹\s*(\d+(?:\.\d{2})?)/g,
//         /Rs\.?\s*(\d+(?:\.\d{2})?)/g,
//         /INR\s*(\d+(?:\.\d{2})?)/g,
//         /\$\s*(\d+(?:\.\d{2})?)/g,
//         /(\d{1,4}(?:\.\d{2})?)\s*(?:total|amount|net|master)/gi, // Numbers before total words
//         /(?:total|amount|net|master|grand)[:\s]*[^ \d]*(\d{1,4}(?:\.\d{2})?)/gi // Numbers after total words
//       ];

//       let maxAmount = 0;
//       for (const pattern of moneyPatterns) {
//         let matches = text.match(pattern);
//         if (matches) {
//           for (const match of matches) {
//             const numMatch = match.match(/(\d+(?:\.\d{2})?)/);
//             if (numMatch) {
//               const amt = parseFloat(numMatch[1]);
//               if (amt > maxAmount && amt > 0.01 && amt < 5000 && !isNaN(amt)) { // Limit to reasonable expense, avoid large IDs
//                 maxAmount = amt;
//               }
//             }
//           }
//         }
//       }

//       // Fallback to largest decimal number if no currency matches
//       if (maxAmount === 0) {
//         const decimalPattern = /\b(\d{1,4}(?:\.\d{2})?)\b/g;
//         let decimalMatch;
//         while ((decimalMatch = decimalPattern.exec(text)) !== null) {
//           const amtStr = decimalMatch[1];
//           if (amtStr.includes('.')) { // Only numbers with decimal
//             const amt = parseFloat(amtStr);
//             if (amt > maxAmount && amt > 0.01 && amt < 5000) {
//               maxAmount = amt;
//             }
//           }
//         }
//       }

//       // Infer decimal for 4-digit money amounts near total words (common OCR error)
//       if (maxAmount === 0) {
//         const fourDigitPattern = /(?:total|amount|net|master|due|pay)[:\s]*(\d{4})/gi;
//         const fourDigitMatch = text.match(fourDigitPattern);
//         if (fourDigitMatch) {
//           const fourDigitStr = fourDigitMatch[fourDigitMatch.length - 1].match(/(\d{4})/)[1];
//           const inferredAmt = parseFloat(fourDigitStr.substring(0, 2) + '.' + fourDigitStr.substring(2));
//           if (inferredAmt > 0.01 && inferredAmt < 5000) {
//             maxAmount = inferredAmt;
//           }
//         }
//       }

//       // General inference: if largest number is 4 digits and no decimals found, infer decimal
//       if (maxAmount === 0) {
//         const allFourDigitPattern = /\b(\d{4})\b/g;
//         let largestFourDigit = 0;
//         let fourMatch;
//         while ((fourMatch = allFourDigitPattern.exec(text)) !== null) {
//           const num = parseInt(fourMatch[1]);
//           if (num > largestFourDigit) {
//             largestFourDigit = num;
//           }
//         }
//         if (largestFourDigit > 100 && largestFourDigit < 10000) { // Reasonable for money
//           const inferredAmt = parseFloat(largestFourDigit.toString().substring(0, 2) + '.' + largestFourDigit.toString().substring(2));
//           maxAmount = inferredAmt;
//         }
//       }

//       if (maxAmount > 0) {
//         extractedAmount = maxAmount;
//       }
//     }

//     // Post-processing: Infer decimal for 4-digit integer amounts (common OCR error)
//     if (extractedAmount && Number.isInteger(extractedAmount) && extractedAmount >= 1000 && extractedAmount <= 9999) {
//       const strAmt = extractedAmount.toString();
//       if (strAmt.length === 4) {
//         const inferredAmt = parseFloat(strAmt.substring(0, 2) + '.' + strAmt.substring(2));
//         if (inferredAmt > 0.01 && inferredAmt < 5000) {
//           extractedAmount = inferredAmt;
//         }
//       }
//     }

//     if (extractedAmount) {
//       amount = extractedAmount;
//     }

//     // Extract date (look for date patterns)
//     const datePatterns = [
//       /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
//       /(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/g,
//       /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/gi
//     ];

//     for (const pattern of datePatterns) {
//       const match = text.match(pattern);
//       if (match) {
//         date = match[0];
//         break;
//       }
//     }

//     // Create note from remaining relevant text
//     const relevantLines = lines.filter(line =>
//       !line.toLowerCase().includes('total') &&
//       !line.toLowerCase().includes('amount') &&
//       !line.match(/^\d/) &&
//       line.length > 3
//     ).slice(0, 3);

//     note = relevantLines.join(' ').substring(0, 100);

//     const category = getCategoryFromMerchant(merchantName);

//     return {
//       merchantName,
//       amount: amount || '',
//       category,
//       date: date ? new Date(date).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
//       note: note || `Scanned from ${merchantName} receipt`
//     };
//   };

//   const handleFileChange = async (event) => {
//     const selectedFile = event.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//       setError(null);
//       setProgress(0);
//       await processImage(selectedFile);
//     }
//   };

//   const processImage = async (imageFile) => {
//     setScanning(true);
//     setProgress(0);

//     try {
//       const worker = await createWorker('eng');

//       // Configure Tesseract for better receipt recognition
//       await worker.setParameters({
//         tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz₹$.,/- :',
//         tessedit_pageseg_mode: '3', // Fully automatic page segmentation
//         tessedit_ocr_engine_mode: '1', // Use LSTM OCR Engine
//         preserve_interword_spaces: '1',
//       });

//       setProgress(50); // Indicate processing has started

//       const { data: { text } } = await worker.recognize(imageFile);

//       console.log('Raw OCR Text:', text); // Temporary log for debugging Swiggy issue

//       setProgress(100); // Indicate processing is complete

//       await worker.terminate();

//       if (!text || text.trim().length < 10) {
//         throw new Error('Could not extract readable text from the image. Please try a clearer image.');
//       }

//       const parsedData = parseReceiptText(text);

//       if (!parsedData.amount) {
//         throw new Error('Could not extract amount from the receipt. Please ensure the total amount is visible.');
//       }

//       onScan(parsedData);
//     } catch (err) {
//       console.error('OCR Error:', err);
//       setError(err.message || 'Failed to process the image. Please try again.');
//     } finally {
//       setScanning(false);
//       setProgress(0);
//     }
//   };

//   return (
//     <div className="bill-scanner-overlay">
//       <div className="bill-scanner-modal">
//         <div className="scanner-header">
//           <h2>Scan Receipt</h2>
//           <button className="close-btn" onClick={onClose}>✕</button>
//         </div>

//         <div className="scanner-content">
//           {error ? (
//             <div className="scanner-error">
//               <div className="error-icon">⚠️</div>
//               <p>{error}</p>
//               <button className="retry-btn" onClick={() => { setError(null); setFile(null); }}>
//                 Try Again
//               </button>
//             </div>
//           ) : (
//             <>
//               <div className="scanner-instructions">
//                 <p>Upload a clear photo of your receipt to automatically extract expense details.</p>
//                 <ul className="tips-list">
//                   <li>Ensure the receipt is well-lit and in focus</li>
//                   <li>Make sure the total amount is clearly visible</li>
//                   <li>Avoid crumpled or damaged receipts</li>
//                 </ul>
//               </div>

//               <div className="file-upload-section">
//                 <label htmlFor="bill-file-input" className="file-upload-btn" disabled={scanning}>
//                   {scanning ? 'Processing...' : 'Upload Receipt Image'}
//                 </label>
//                 <input
//                   id="bill-file-input"
//                   type="file"
//                   accept="image/*"
//                   className="file-input"
//                   onChange={handleFileChange}
//                   disabled={scanning}
//                 />
//               </div>

//               {scanning && (
//                 <div className="scanning-indicator">
//                   <div className="spinner"></div>
//                   <p>Analyzing receipt...</p>
//                   <div className="progress-bar">
//                     <div className="progress-fill" style={{ width: `${progress}%` }}></div>
//                   </div>
//                   <p>{progress}% complete</p>
//                 </div>
//               )}

//               <div className="scanner-info">
//                 <p><strong>Note:</strong> OCR works best with clear, high-contrast images. If extraction fails, you can manually enter the details.</p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BillScanner;
