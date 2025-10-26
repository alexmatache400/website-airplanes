import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import Footer from './components/Footer';
import AffiliateDisclosure from './components/AffiliateDisclosure';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Products from './pages/Products';
import Setups from './pages/Setups';
import CompleteSetup from './pages/CompleteSetup';
import AboutUs from './pages/AboutUs';
import Terms from './pages/legal/Terms';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import CookiePolicy from './pages/legal/CookiePolicy';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Compliance Banners */}
        <AffiliateDisclosure />
        <CookieBanner />

        {/* Main Navigation */}
        <HeaderNav />

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/setups" element={<Setups />} />
            <Route path="/complete-setup" element={<CompleteSetup />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/legal/terms" element={<Terms />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/cookies" element={<CookiePolicy />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
