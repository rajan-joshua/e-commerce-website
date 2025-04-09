import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // update path if needed
import '../styles/ProductDetails.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';


const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          console.log("No such product!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="not-found">Product not found.</div>;

  return (
    <div className="product-details">
      <div className="product-info" data-aos="fade-up">
        <img src={product.image} alt={product.name} />
        <div className="product-info-content">
          <h2>{product.name}</h2>
          <div className="product-price">₹{product.price}</div>
          <p>{product.description}</p>

          {product.prediction && (
            <div className="prediction-meter">
              <label>Price Prediction Trend</label>
              <div className="bar">
                <div className="fill" style={{ width: product.prediction + '%' }}></div>
              </div>
              <span>{product.prediction}% chance of price drop next week</span>
            </div>
          )}
        </div>
      </div>

      {product.sellers && (
        <div className="sellers" data-aos="zoom-in">
          <h3>Available From</h3>
          <div className="sellers-list">
            {product.sellers.map((seller, index) => (
              <div className="seller-card" key={index} data-aos="fade-up" data-aos-delay={index * 100}>
                <a href={seller.url} target="_blank" rel="noopener noreferrer">
                  {seller.name}
                </a>
                <span>₹{seller.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

{product.priceHistory && product.priceHistory.length > 0 && (
  <div className="price-history" data-aos="fade-up">
    <h3>Price History (Graph)</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={product.priceHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={['auto', 'auto']} />
        <Tooltip />
        <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}

    </div>
  );
};

export default ProductDetails;
