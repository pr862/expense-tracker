import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import '../../styles/QRScanner.css';

const QRScanner = ({ onScan, onClose }) => {
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [qrError, setQrError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Category mapping based on merchant name keywords
  const getCategoryFromMerchant = (merchantName) => {
    const name = merchantName.toLowerCase();
    if (name.includes('swiggy') || name.includes('zomato') || name.includes('food') || name.includes('restaurant')) {
      return 'food';
    } else if (name.includes('amazon') || name.includes('flipkart') || name.includes('shopping') || name.includes('store')) {
      return 'shopping';
    } else if (name.includes('uber') || name.includes('ola') || name.includes('taxi') || name.includes('transport')) {
      return 'transport';
    } else if (name.includes('netflix') || name.includes('prime') || name.includes('entertainment')) {
      return 'entertainment';
    } else if (name.includes('recharge') || name.includes('mobile') || name.includes('bill')) {
      return 'utilities';
    } else {
      return 'other'; // Default category
    }
  };

  // Parse UPI QR code data
  const parseUPIData = (qrData) => {
    const url = new URL(qrData);
    const params = new URLSearchParams(url.search);
    const merchantName = params.get('pn') || 'Unknown Merchant';
    const amount = params.get('am') ? parseFloat(params.get('am')) : '';
    const category = getCategoryFromMerchant(merchantName);

    return {
      merchantName,
      amount,
      category,
      note: `Scanned from ${merchantName} QR code`
    };
  };

  const capture = () => {
    if (!scanning) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanning(false);
          try {
            const parsedData = parseUPIData(code.data);
            onScan(parsedData);
          } catch (err) {
            setQrError('Invalid QR code format. Please scan a valid UPI/merchant QR code.');
            setScanning(true);
          }
        } else {
          // Continue scanning
          setTimeout(capture, 100);
        }
      };
      img.src = imageSrc;
    } else {
      setTimeout(capture, 100);
    }
  };

  useEffect(() => {
    if (scanning && cameraReady) {
      capture();
    }
  }, [scanning, cameraReady]);

  const handleUserMediaError = (err) => {
    setCameraError('Camera access denied or not available. Please allow camera access and try again.');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScanning(false);
            try {
              const parsedData = parseUPIData(code.data);
              onScan(parsedData);
            } catch (err) {
              setQrError('Invalid QR code format. Please upload a valid UPI/merchant QR code image.');
            }
          } else {
            setQrError('No QR code found in the image. Please try another image.');
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div className="scanner-header">
          <h2>Scan QR Code</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="scanner-content">
          {qrError ? (
            <div className="scanner-error">
              <div className="error-icon">⚠️</div>
              <p>{qrError}</p>
              <button className="retry-btn" onClick={() => { setQrError(null); setScanning(true); }}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="scanner-instructions">
                <p>Point your camera at a UPI or merchant QR code to scan and pre-fill expense details.</p>
              </div>
              <div className="file-upload-section">
                <label htmlFor="qr-file-input" className="file-upload-btn">
                  Or upload QR code image
                </label>
                <input
                  id="qr-file-input"
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={handleFileChange}
                />
              </div>
              {cameraError ? (
                <div className="scanner-error">
                  <div className="error-icon">📷</div>
                  <p>{cameraError}</p>
                  <p>You can still upload a QR code image above.</p>
                </div>
              ) : (
                <>
                  <div className="webcam-container">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: 'environment' // Use back camera on mobile
                      }}
                      onUserMedia={() => setCameraReady(true)}
                      onUserMediaError={handleUserMediaError}
                      className="webcam"
                    />
                    <div className="scanner-overlay">
                      <div className="scanner-frame"></div>
                    </div>
                  </div>
                  <div className="scanning-indicator">
                    <div className="spinner"></div>
                    <p>Scanning for QR code...</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
