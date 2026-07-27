import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Works from './pages/Works';
import SeriesPage from './pages/SeriesPage';
import About from './pages/About';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:slug" element={<SeriesPage />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </Router>
  );
}

export default App;
