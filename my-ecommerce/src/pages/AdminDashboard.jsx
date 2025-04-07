import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async (user) => {
      if (!user) return;
      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);
      setIsAdmin(adminDoc.exists());
    };

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        checkAdmin(user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };
    
    const fetchOrders = async () => {
      const orderSnapshot = await getDocs(collection(db, "orders"));
      const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderList);
    };
    
    fetchProducts();
    fetchOrders();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productName || !price || !imageUrl || !description) return;
    
    await addDoc(collection(db, "products"), {
      name: productName,
      price: parseFloat(price),
      image: imageUrl,
      description: description,
    });
    
    alert("Product added successfully!");
    setProductName("");
    setPrice("");
    setImageUrl("");
    setDescription("");
  };

  if (!isAdmin) return <h2 className="access-denied">Access Denied</h2>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>
      <form className="admin-form" onSubmit={handleAddProduct}>
        <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <button type="submit" className="add-product-button">Add Product</button>
      </form>
      <h2 className="product-list-title">Existing Products</h2>
      <ul className="product-list">
        {products.map(product => (
          <li key={product.id} className="product-item">
            <img src={product.image} alt={product.name} className="product-image" />
            <div>
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <p>{product.description}</p>
            </div>
          </li>
        ))}
      </ul>
      
      <h2 className="order-list-title">Orders</h2>
      <ul className="order-list">
        {orders.length === 0 ? (
          <p>No orders available.</p>
        ) : (
          orders.map((order) => (
            <li key={order.id} className="order-item">
              <h3>Order by: {order.name}</h3>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Address:</strong> {order.address}, {order.pincode}</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
              <h4>Items:</h4>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.name} - ${item.price} x {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default AdminDashboard;
