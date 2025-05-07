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
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
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
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { name, phone, address, pincode }, { merge: true });

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        name,
        phone,
        address,
        pincode,
        total: totalPrice,
        paymentMethod,
        items: cart,
        timestamp: serverTimestamp(),
      });

      alert("Payment successful! Order placed.");
      setCart([]);
      navigate("/order-success", {
        state: {
          userDetails: { name, phone, address, pincode },
          items: cart,
          total: totalPrice,
          paymentMethod,
        },
      });
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

          <div className="checkout-payment-options">
            <h2>Select Payment Method</h2>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Cash on Delivery
            </label>
            <label style={{ opacity: 0.6 }}>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                disabled
              />
              Online Payment (coming soon)
            </label>
            <div className="checkout-payment-note">
              💡 Online payment will be added soon...
            </div>
          </div>

          <div className="checkout-items">
            {cart.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.image} alt={item.name} className="checkout-item-image" />
                <div>
                  <h3>{item.name}</h3>
                  <p>Price: ₹{Number(item.price || 0).toFixed(2)}</p>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
          <button className="pay-btn" onClick={handlePayment}>Place Order</button>
        </>
      )}
    </div>
  );
};

export default Checkout;