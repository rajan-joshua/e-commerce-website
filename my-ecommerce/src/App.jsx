import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { CartProvider } from "./context/CartContext"; // Import CartProvider
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cart from "./pages/Cart"; // Ensure correct import
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetails from "./pages/ProductDetails";
import OrderSuccess from "./pages/order-success";
import SearchResults from "./pages/SearchResults";




// Authentication functions
const logOut = async () => {
  await signOut(auth);
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  return (
    <CartProvider> {/* Wrap the entire app inside CartProvider */}
      <Router>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admindashboard" element={<AdminDashboard/>}/>   
          <Route path="/product/:id" element={<ProductDetails />} />       
          <Route path="/order-success" element={<OrderSuccess/>}/>
          <Route path="/products" element={<SearchResults />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
