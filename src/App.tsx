import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeaderNav from './components/HeaderNav';
import Footer from './components/Footer';
import AffiliateDisclosure from './components/AffiliateDisclosure';
import CookieBanner from './components/CookieBanner';
import SiteSchema from './components/SiteSchema';
import { DataProvider } from './lib/DataProvider';
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Setups = lazy(() => import('./pages/Setups'));
const CompleteSetup = lazy(() => import('./pages/CompleteSetup'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <DataProvider>
      <SiteSchema />
      <div className="min-h-screen flex flex-col">
        {/* Compliance Banners */}
        <AffiliateDisclosure />
        <CookieBanner />

        {/* Main Navigation */}
        <HeaderNav />

        {/* Main Content */}
        <main className="flex-1">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/setups" element={<Setups />} />
              <Route path="/complete-setup" element={<CompleteSetup />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/legal/terms" element={<Terms />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>
      </DataProvider>
    </Router>
  );
}

export default App;
