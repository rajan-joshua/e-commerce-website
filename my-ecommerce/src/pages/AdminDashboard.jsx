import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Admindashboard.css";

const AdminDashboard = () => {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    prediction: "",
    sellers: "",
    priceHistory: ""
  });

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, price, image, description, prediction, sellers, priceHistory } = product;

    // Basic check
    if (!name || !price || !image || !description) {
      alert("Please fill out required fields.");
      return;
    }

    let sellersParsed = [];
    let priceHistoryParsed = [];

    try {
      sellersParsed = JSON.parse(sellers);
      if (!Array.isArray(sellersParsed)) throw new Error();
    } catch {
      alert("❌ Sellers must be a valid JSON array.");
      return;
    }

    try {
      priceHistoryParsed = JSON.parse(priceHistory);
      if (!Array.isArray(priceHistoryParsed)) throw new Error();
    } catch {
      alert("❌ Price History must be a valid JSON array.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        image,
        description,
        prediction: parseFloat(prediction) || 0,
        sellers: sellersParsed,
        priceHistory: priceHistoryParsed
      });

      alert("✅ Product added successfully!");
      setProduct({
        name: "",
        price: "",
        image: "",
        description: "",
        prediction: "",
        sellers: "",
        priceHistory: ""
      });
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product.");
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <label>Product Name*</label>
        <input type="text" name="name" value={product.name} onChange={handleChange} required />

        <label>Price*</label>
        <input type="number" name="price" value={product.price} onChange={handleChange} required />

        <label>Image URL*</label>
        <input type="text" name="image" value={product.image} onChange={handleChange} required />

        <label>Description*</label>
        <textarea name="description" value={product.description} onChange={handleChange} required />

        <label>Price Prediction (%)</label>
        <input type="number" name="prediction" value={product.prediction} onChange={handleChange} />

        <label>Sellers (JSON array)</label>
        <textarea
          name="sellers"
          value={product.sellers}
          onChange={handleChange}
          placeholder='[{"name":"Amazon","price":25,"link":"https://..."}, ...]'
        />

        <label>Price History (JSON array)</label>
        <textarea
          name="priceHistory"
          value={product.priceHistory}
          onChange={handleChange}
          placeholder='[{"date":"2025-01-01","price":29.99}, ...]'
        />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AdminDashboard;
