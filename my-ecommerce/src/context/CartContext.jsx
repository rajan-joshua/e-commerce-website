import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevent flickering on reload

  // Load cart when user logs in or app starts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const cartRef = doc(db, "carts", currentUser.uid);
          const cartSnap = await getDoc(cartRef);

          if (cartSnap.exists()) {
            setCart(cartSnap.data().items || []);
          } else {
            setCart([]); // Initialize empty cart if Firestore has no data
          }
        } catch (error) {
          console.error("Error loading cart:", error);
        }
      } else {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCart(savedCart);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save cart to Firestore or localStorage
  useEffect(() => {
    if (!loading) {
      if (user) {
        const saveCartToFirebase = async () => {
          try {
            const cartRef = doc(db, "carts", user.uid);
            await setDoc(cartRef, { items: cart }, { merge: true });
          } catch (error) {
            console.error("Error saving cart:", error);
          }
        };
        saveCartToFirebase();
      } else {
        localStorage.setItem("cart", JSON.stringify(cart));
      }
    }
  }, [cart, user, loading]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}
    >
      {!loading && children} {/* Prevents flashing empty cart */}
    </CartContext.Provider>
  );
};

export default CartProvider;




