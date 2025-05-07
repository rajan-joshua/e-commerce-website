import { useLocation, useNavigate } from "react-router-dom";
import "../styles/order-success.css"; // You can reuse existing styles

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userDetails, items, total, paymentMethod } = location.state || {};

  const getDeliveryEstimate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4); // 4-day estimate
    return deliveryDate.toDateString();
  };

  if (!userDetails || !items) {
    return (
      <div className="checkout-container">
        <h1>No Order Data Found</h1>
        <button className="pay-btn" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>🎉 Order Placed Successfully!</h1>
      <p>Thank you for your order. Below are your details:</p>

      <h2>👤 User Details</h2>
      <p><strong>Name:</strong> {userDetails.name}</p>
      <p><strong>Phone:</strong> {userDetails.phone}</p>
      <p><strong>Address:</strong> {userDetails.address}, {userDetails.pincode}</p>

      <h2>🛍️ Items Ordered</h2>
      <div className="checkout-items">
        {items.map((item, i) => (
          <div key={i} className="checkout-item">
            <img src={item.image} alt={item.name} className="checkout-item-image" />
            <div>
              <h3>{item.name}</h3>
              <p>Price: ₹{item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>💰 Total: ₹{total.toFixed(2)}</h2>
      <h2>💳 Payment Method: {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</h2>
      <h2>🚚 Estimated Delivery: <span style={{ color: '#22eaaa' }}>{getDeliveryEstimate()}</span></h2>
      <button className="pay-btn" onClick={() => navigate("/")}>🏠 Go to Home</button>
    </div>
  );
};

export default OrderSuccess;
