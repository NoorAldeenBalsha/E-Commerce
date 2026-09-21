import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  Smartphone, 
  Laptop, 
  Headphones, 
  Gamepad2, 
  Star 
} from 'lucide-react';
import { useToast } from './ToastProvider.jsx';
import '../css/Home.css';

export const HomePage = () => {
  const [cartCount, setCartCount] = useState(2);
  const { showToast } = useToast();

  const categories = [
    { id: 1, name: 'Smartphones', icon: <Smartphone size={30} /> },
    { id: 2, name: 'Laptops', icon: <Laptop size={30} /> },
    { id: 3, name: 'Audio', icon: <Headphones size={30} /> },
    { id: 4, name: 'Gaming', icon: <Gamepad2 size={30} /> },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Smart Watch & Mobile Pack',
      price: 25.00,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 2,
      name: 'Ultra Gaming Laptop X',
      price: 29.80,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 3,
      name: 'Flagship Smartphone Pro',
      price: 10.00,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
    },
    {
      id: 4,
      name: 'Titanium Phone Edition',
      price: 18.80,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&auto=format&fit=crop&q=60',
    },
  ];

  const handleAddToCart = (productName) => {
    setCartCount((prev) => prev + 1);
    showToast(`Added "${productName}" to your cart!`, 'routine', 3000);
  };

  return (
    <div className="home-wrapper">
      {/* 1. Navbar */}
      <nav className="navbar">
        <a href="#home" className="nav-brand">
          <div className="brand-icon-box">
            <ShoppingBag size={22} />
          </div>
          <span className="brand-title">Hola Market</span>
        </a>

        <ul className="nav-links">
          <li><a href="#home" className="nav-link active">Home</a></li>
          <li><a href="#shop" className="nav-link">Shop</a></li>
          <li><a href="#deals" className="nav-link">Deals</a></li>
          <li><a href="#contact" className="nav-link">Contact</a></li>
        </ul>

        <div className="nav-search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search devices, accessories..." />
        </div>

        <div className="nav-actions">
          <button className="icon-btn" title="Profile">
            <User size={20} />
          </button>
          <button className="icon-btn" title="Wishlist">
            <Heart size={20} />
          </button>
          <button className="icon-btn" title="Cart">
            <ShoppingCart size={20} />
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-decor">
          <div className="hero-stripe stripe-lg" />
          <div className="hero-glow-dot glow-1" />
          <div className="hero-glow-dot glow-2" />
        </div>

        <div className="hero-image-box">
          <img 
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80" 
            alt="Flagship Laptop" 
            className="hero-laptop-img"
          />
        </div>

        <div className="hero-content">
          <h1 className="hero-headline">
            Level Up Your Tech with Holiday Deals!
          </h1>
          <button className="btn-shop-now">Shop Now</button>
          <div className="hero-dots">
            <span className="dot active" />
            <span className="dot" />
            <span className="dot" />
          </div>
        </div>
      </header>

      {/* 3. Category Cards */}
      <section className="section-container">
        <h2 className="section-title">Category Cards</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="cat-icon-wrap">{cat.icon}</div>
              <span className="cat-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Products */}
      <section className="section-container">
        <h2 className="section-title">Featured Products</h2>
        <div className="products-grid">
          {featuredProducts.map((prod) => (
            <div key={prod.id} className="product-card">
              <div className="prod-img-box">
                <img src={prod.image} alt={prod.name} />
              </div>
              <div className="prod-details">
                <div className="rating-stars">
                  {[...Array(prod.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#ff9800" strokeWidth={0} />
                  ))}
                </div>
                <div className="prod-price-row">
                  <span className="prod-price">${prod.price.toFixed(2)}</span>
                  <button 
                    className="btn-add-cart" 
                    onClick={() => handleAddToCart(prod.name)}
                    title="Add to Cart"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;