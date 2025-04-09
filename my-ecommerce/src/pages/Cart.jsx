import { useCart } from "../context/CartContext";
import "../styles/Cart.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Cart = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCheckout = () => {
    const confirmRedirect = window.confirm("Are you sure you want to proceed to checkout?");
    if (confirmRedirect) {
      setShowMessage(true);
      setTimeout(() => {
        navigate("/checkout");
      }, 2000); // Show message for 2 seconds before redirecting
    }
  };

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div>
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
      {cart.length > 0 && <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>}
      {showMessage && <div className="floating-message">Redirecting to Checkout...</div>}
    </div>
  );
};

export default Cart;
