import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../styles/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct(data);
        setPriceHistory(Array.isArray(data.priceHistory) ? data.priceHistory : []); // Ensure priceHistory is an array
      } else {
        console.error("Product not found!");
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found!</p>;

  return (
    <div className="product-details-container">
      <img src={product.image} alt={product.name} className="product-image" onError={(e) => e.target.src = "/images/placeholder.jpg"} />
      <h1>{product.name}</h1>
      <p className="product-price">${product.price}</p>
      <p className="product-description">{product.description}</p>

      {priceHistory.length > 0 ? (
        <div className="price-history-chart">
          <h2>Price Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>No price history available.</p>
      )}
    </div>
  );
};

export default ProductDetails;

