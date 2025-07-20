import { useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import './App.css';
import logo from './assets/escan.png';
import ReactModal from 'react-modal';

function App() {
  const [item, setItem] = useState({ id: '', name: '', price: '', description: '' });
  const [showModal, setShowModal] = useState(false);
  const [pdfDoc, setPdfDoc] = useState<jsPDF | null>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  // JWT state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');

  // Login handler
  const handleLogin = async () => {
    try {
      const res = await fetch('https://barcodesystem.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('jwtToken', data.token);
      alert('Login successful!');
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const generateBarcode = () => {
    if (barcodeRef.current && item.id) {
      JsBarcode(barcodeRef.current, `https://barcodesystem.onrender.com/api/itemdetails/${item.id}`, {
        format: 'CODE128',
        displayValue: false,
        width: 1.5,
        height: 30,
        margin: 0,
      });
      // Set canvas size explicitly for consistent display
      barcodeRef.current.width = 180;
      barcodeRef.current.height = 40;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('https://barcodesystem.onrender.com/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) throw new Error('Failed to save');
      const saved = await res.json();
      alert('Item saved to backend!');
      console.log(saved);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handlePrint = () => {
    const doc = new jsPDF();

    // Banner background
    doc.setFillColor(30, 144, 255); // Dodger Blue
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');

    // Company logo
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 5, 20, 20);

      // Company name in bold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('BARCODE SYSTEM', 35, 20);

      // Section title
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('InvenTag - Item Details', 20, 40);

      // Item details
      doc.setFontSize(12);
      doc.text(`Item ID: ${item.id}`, 20, 60);
      doc.text(`Name: ${item.name}`, 20, 70);
      doc.text(`Price: ₹${item.price}`, 20, 80);
      doc.text(`Description: ${item.description}`, 20, 90);

      // Barcode
      const barcodeCanvas = barcodeRef.current;
      if (barcodeCanvas) {
        const imgData = barcodeCanvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, 100, 100, 30);
      }

      setPdfDoc(doc);
      setShowModal(true);
    };
  };

  const handleDownloadPDF = () => {
    if (pdfDoc) {
      pdfDoc.save(`item-${item.id}.pdf`);
      setShowModal(false);
    }
  };

  return (
    <div className="container">
      <img src={logo} alt="InvenTag Logo" className="logo" />
      <h1>Barcode Prints</h1>

      {!token ? (
        <div>
          <input
            name="username"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <input name="id" placeholder="Item ID" value={item.id} onChange={handleChange} onBlur={generateBarcode} />
          <input name="name" placeholder="Item Name" value={item.name} onChange={handleChange} />
          <input name="price" placeholder="Price" value={item.price} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={item.description} onChange={handleChange} />

          <canvas ref={barcodeRef} />

          <div className="buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={handlePrint}>Print PDF</button>
          </div>
        </>
      )}

      <ReactModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        className="pdf-modal"
        overlayClassName="pdf-modal-overlay"
        ariaHideApp={false}
      >
        <h2>PDF Ready!</h2>
        <p>Your PDF is ready to download.</p>
        <button onClick={handleDownloadPDF} className="download-btn">
          Download PDF
        </button>
        <button onClick={() => setShowModal(false)} className="close-btn">
          Close
        </button>
      </ReactModal>
    </div>
  );
}

export default App;
