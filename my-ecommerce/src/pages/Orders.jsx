import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date
          date: doc.data().timestamp?.toDate() || new Date()
        }));

        // Sort by date (newest first)
        ordersList.sort((a, b) => b.date - a.date);
        setOrders(ordersList);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="shop-now-btn">
            Shop Now
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.slice(0, 8)}</h3>
                  <p className="order-date">
                    {order.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="order-total">
                  Total: ${order.total.toFixed(2)}
                </div>
              </div>

              <div className="order-items">
                {order.items.map(item => (
                  <div key={`${order.id}-${item.id}`} className="order-item">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="order-item-image" 
                    />
                    <div className="order-item-details">
                      <h4>{item.name}</h4>
                      <p>${item.price} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <p>Shipping to: {order.address}</p>
                <p>Pincode: {order.pincode}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;