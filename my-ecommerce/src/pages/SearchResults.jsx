// src/pages/SearchResults.jsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "../styles/Home.css"; // Reuse existing styling

const SearchResults = () => {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(results);
    };

    fetchProducts();
  }, [searchTerm]);

  return (
    <div className="home-container">
      <section className="hero">
        <h1>Search Results</h1>
        <p>Showing results for "<strong>{searchTerm}</strong>"</p>
      </section>

      <section className="products-container">
        <h2>Matching Products</h2>
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <div className="product-card">
                  <div className="image-container">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <h3>{product.name}</h3>
                  <p>₹{product.price}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="loading-message">No products found matching your search.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default SearchResults;

