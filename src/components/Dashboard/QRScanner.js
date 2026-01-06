import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import Tesseract from 'tesseract.js'; 
import '../../styles/QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Scanning for QR...');
  const [error, setError] = useState(null);

  const parseTextForBillData = (text) => {
    // 1. Pre-process: Thermal receipts often have '.' that look like ','
    let cleanedText = text.replace(/,/g, '.'); 
    cleanedText = cleanedText.replace(/\d{10,}/g, ''); // Remove Phone Numbers/GSTINs
  
    const lines = cleanedText.split('\n').map(l => l.trim());
    let merchantName = "Unknown Merchant";
    let amount = "";
    let date = "";
    const lowerText = cleanedText.toLowerCase();
  
    // 2. Identify Merchant
    if (lowerText.includes('d-mart') || lowerText.includes('avenue supermarts')) merchantName = "D-Mart";
    else if (lowerText.includes('swiggy')) merchantName = "Swiggy";
    else if (lowerText.includes('walmart')) merchantName = "Walmart";
    else if (lines[0]) merchantName = lines[0].substring(0, 25);
  
    // 3. EXTRACT DATE (DD/MM/YYYY)
    const dateMatch = cleanedText.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
    if (dateMatch) date = dateMatch[1];

    // 4. TARGETED AMOUNT EXTRACTION
    
    // A. Specific D-Mart "Qty" Line (Reliable: Items: 12 Qty: 13 1095.85)
    const qtyLineMatch = cleanedText.match(/(?:Items|Items:)\s*\d+\s*(?:Qty|Qty:)\s*\d+\s*(\d+\.\d{2})/i);
    
    // B. Fix for "T" Line (GST Summary)
    // We want the LAST decimal number on the line starting with 'T'
    const tLine = lines.find(l => l.startsWith('T ') || l.startsWith('T:'));
    let tAmount = "";
    if (tLine) {
        const numbers = tLine.match(/(\d+\.\d{2})/g);
        if (numbers) tAmount = numbers[numbers.length - 1]; 
    }

    // C. Payment Confirmation Line (e.g., Card Payment: 1095.85)
    const paymentMatch = cleanedText.match(/(?:Payment|Amt Recd|Paid)\s*[:\s]*(\d+\.\d{2})/i);

    // D. Exclusion Logic for "Saved" amounts
    const savedRegex = /\b(?:Saved|Savings|Discount|You Save)\b\s*[:$₹RS\.]?\s*(\d+\.\d{2})/gi;
    const savedMatches = [...cleanedText.matchAll(savedRegex)].map(m => parseFloat(m[1]));

    // Priority Decision
    if (qtyLineMatch) {
      amount = qtyLineMatch[1];
    } else if (tAmount) {
      amount = tAmount;
    } else if (paymentMatch) {
      amount = paymentMatch[1];
    } else {
      // Fallback: standard keywords checking from bottom up
      const totalKeywordsRegex = /\b(?:Grand Total|Net Payable|Total Amount|Total|Amt)\b\s*[:$₹RS\.]?\s*(\d+\.\d{2})/gi;
      const matches = [...cleanedText.matchAll(totalKeywordsRegex)];
      for (let i = matches.length - 1; i >= 0; i--) {
        const val = parseFloat(matches[i][1]);
        if (!savedMatches.includes(val)) {
          amount = matches[i][1];
          break;
        }
      }
    }
  
    return {
      merchantName,
      amount: amount ? parseFloat(amount) : "",
      date: date || new Date().toISOString().split('T')[0], // Use found date or today
      category: getCategory(merchantName),
      note: "Auto-scanned"
    };
  };
  const getCategory = (name) => {
    const n = name.toLowerCase();
    if (n.includes('d-mart') || n.includes('walmart') || n.includes('amazon')) return 'Shopping';
    if (n.includes('swiggy') || n.includes('zomato')) return 'Food';
    if (n.includes('power') || n.includes('electric')) return 'Utilities';
    return 'Other';
  }

  const processImage = async (imageSrc) => {
    setLoading(true);
    setStatusMessage('Checking for Payment QR...');
    setError(null);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
        const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data.toLowerCase().includes('upi://')) {
        const url = new URL(code.data);
        const params = new URLSearchParams(url.search);
        onScan({
          merchantName: params.get('pn') || 'UPI Merchant',
          amount: params.get('am') || '',
          category: 'Other',
          note: "Scanned via UPI QR"
        });
        setLoading(false);
        return;
      }

      setStatusMessage('Reading receipt text...');
      try {
        const result = await Tesseract.recognize(img, 'eng');
        const parsed = parseTextForBillData(result.data.text);
        
        if (parsed.amount) {
          onScan(parsed);
        } else {
          setError("Total amount not found. Please try a clearer photo.");
        }
      } catch (err) {
        setError("Text recognition failed.");
      }
      setLoading(false);
    };
    img.src = imageSrc;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => processImage(f.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => processImage(f.target.result);
      reader.readAsDataURL(file);
    }
  };

  const capture = () => {
    if (!scanning || loading || !webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    if (screenshot) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = jsQR(data.data, data.width, data.height);
        if (qr && qr.data.toLowerCase().includes('upi://')) {
          setScanning(false);
          processImage(screenshot);
        } else {
          setTimeout(capture, 500);
        }
      };
      img.src = screenshot;
    }
  };

  useEffect(() => {
    if (scanning) capture();
  }, [scanning]);

  return (
    <div className="qr-scanner-overlay" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <div className="qr-scanner-modal">
        <div className="scanner-header">
          <h2>Scan or Upload Bill</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>{statusMessage}</p>
            </div>
          ) : error ? (
            <div className="scanner-error">
              <p>⚠️ {error}</p>
              <button className="retry-btn" onClick={() => {setError(null); setScanning(true);}}>Try Again</button>
            </div>
          ) : (
            <>
              <div className="webcam-container">
                <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
                <div className="scanner-overlay"><div className="scanner-frame"></div></div>
              </div>
              <div className="file-upload-section">
                <p>Drag & Drop receipt or</p>
                <label className="file-upload-btn">
                  Choose File
                  <input type="file" onChange={handleFileChange} hidden />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;