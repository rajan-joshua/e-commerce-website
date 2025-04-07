import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "../styles/Home.css";
import logo from "../assets/logo.png";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { 
      setUser(currentUser);
      if (currentUser) {
        const adminDocRef = doc(db, "admins", currentUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = () => {
    navigate(`/products?search=${searchTerm}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
    setShowProfileMenu(false);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <img src={logo} alt="Logo" className="home-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }} />
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div className="header-buttons">
          <Link to="/cart" className="cart-button">
            <span role="img" aria-label="cart">🛒</span>
            {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </Link>
          
          {user ? (
            <div className="profile-container" ref={profileRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="profile-button">
                <span className="user-avatar">{user?.email ? user.email.charAt(0).toUpperCase() : "U"}</span>
              </button>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <Link to="/orders" className="dropdown-item">📦 My Orders</Link>
                  {isAdmin && (
                    <Link to="/AdminDashboard" className="dropdown-item">⚙️ Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item logout">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>
      </header>

      <section className="hero">
        <h1>Welcome to My E-Commerce Store</h1>
        <p>Find the best products at amazing prices!</p>
      </section>

      <section className="products-container">
        <h2>Featured Products</h2>
        <div className="products-grid">
          {products.length > 0 ? (
            products.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                <div className="product-card">
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                  <button onClick={(e) => { e.preventDefault(); addToCart(product); }} className="add-to-cart">Add to Cart</button>
                </div>
              </Link>
            ))
          ) : (
            <p className="loading-message">Loading products...</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
