import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import JsBarcode from 'jsbarcode';

interface Item {
  id: string;
  name: string;
  price: string;
  description: string;
}

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<Item | null>(null);
  const [error, setError] = useState('');
  const barcodeRef = useRef<HTMLCanvasElement>(null);
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/items/${id}`,{
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
      .then(res => {
        if (!res.ok) throw new Error('Item not found');
        return res.json();
      })
      .then(data => {
        setItem(data);
        if (barcodeRef.current) {
          JsBarcode(barcodeRef.current, data.id, {
            format: 'CODE128',
            displayValue: true,
            width: 2,
            height: 40,
          });
        }
      })
      .catch(err => setError(err.message));
  }, [id]);

  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  if (!item) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 500, margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>📦 Item Details</h2>
      <p><strong>Item ID:</strong> {item.id}</p>
      <p><strong>Name:</strong> {item.name}</p>
      <p><strong>Price:</strong> ₹{item.price}</p>
      <p><strong>Description:</strong> {item.description}</p>
      <canvas ref={barcodeRef} style={{ marginTop: 20 }} />
    </div>
  );
}

export default ItemDetail;
