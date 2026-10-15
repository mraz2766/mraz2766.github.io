import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { opensPhoto } from './lib/motion';
import Layout from './components/Layout';
import Home from './pages/Home';
import Works from './pages/Works';
import About from './pages/About';

// /works and /works/:slug share one page instance so switching series only
// swaps the grid instead of fading the whole page out and in.
function getTransitionKey(pathname) {
  return pathname.startsWith('/works') ? '/works' : pathname;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence
      mode="wait"
      custom={opensPhoto(location.search)}
      // Start each new page at the top once the old one has faded out.
      onExitComplete={() => window.scrollTo(0, 0)}
    >
      <Routes location={location} key={getTransitionKey(location.pathname)}>
        <Route path="/" element={<Home />} />
        <Route path="/works/:slug?" element={<Works />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      {/* LazyMotion + `m` components ship only the animation features we use. */}
      <LazyMotion features={domAnimation} strict>
        {/* Respect the OS "reduce motion" setting for every framer animation. */}
        <MotionConfig reducedMotion="user">
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </MotionConfig>
      </LazyMotion>
    </Router>
  );
}

export default App;
