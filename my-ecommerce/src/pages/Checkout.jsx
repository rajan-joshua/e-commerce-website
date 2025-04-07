import { useCart } from "../context/CartContext";
import "../styles/Checkout.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from "firebase/firestore";

const Checkout = () => {
  const { cart, setCart } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user details from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "");
          setPhone(userData.phone || "");
          setAddress(userData.address || "");
          setPincode(userData.pincode || "");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const totalPrice = cart.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);

  const handlePayment = async () => {
    if (!name || !phone || !address || !pincode) {
      alert("Please fill in all the details.");
      return;
    }

    try {
      // Save user details to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { name, phone, address, pincode }, { merge: true });

      // Save order to Firestore
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        name,
        phone,
        address,
        pincode,
        total: totalPrice,
        items: cart,
        timestamp: serverTimestamp(),
      });

      alert("Payment successful! Order placed.");
      setCart([]); // Empty the cart after order placement
      navigate("/");
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (!user) {
    return (
      <div className="checkout-container">
        <h1>Please Login to Continue</h1>
        <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="checkout-form">
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input type="text" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
          </div>
          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} className="checkout-item-image" />
                <div>
                  <h3>{item.name}</h3>
                  <p>Price: ${Number(item.price || 0).toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <h2>Total: ${totalPrice.toFixed(2)}</h2>
          <button className="pay-btn" onClick={handlePayment}>Pay Now</button>
        </>
      )}
    </div>
  );
};

export default Checkout;
