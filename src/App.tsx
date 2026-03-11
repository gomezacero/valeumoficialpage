import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from 'lucide-react';
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";

const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [pathname, hash]);

  return null;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string, hash?: string) => {
    if (location.pathname !== path) {
      navigate(hash ? `${path}${hash}` : path);
    } else if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`apple-glass rounded-full px-8 py-3 flex justify-between items-center transition-all duration-500 ${scrolled ? 'shadow-2xl' : 'bg-transparent border-transparent shadow-none'}`}>
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleNav('/')}>
              <span className="text-xl font-extrabold tracking-tighter text-white">VALEUM</span>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
            
            <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <button onClick={() => handleNav('/', '#servicios')} className="hover:text-white transition-colors">Servicios</button>
              <button onClick={() => handleNav('/jobs')} className={`hover:text-white transition-colors ${location.pathname === '/jobs' ? 'text-white' : ''}`}>Careers</button>
              <button onClick={() => handleNav('/', '#contacto')} className="text-white bg-white/10 px-6 py-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">Match</button>
            </nav>

            <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl pt-32 px-10 md:hidden">
          <div className="flex flex-col gap-10 text-4xl font-extrabold tracking-tighter text-white">
            <button onClick={() => handleNav('/', '#servicios')} className="text-left hover:text-blue-500 transition-colors">Servicios</button>
            <button onClick={() => handleNav('/jobs')} className="text-left hover:text-purple-500 transition-colors">Careers</button>
            <button onClick={() => handleNav('/', '#contacto')} className="text-left text-blue-500 underline underline-offset-8">Match</button>
          </div>
          <button className="absolute top-8 right-6 p-2 text-white" onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
        </div>
      )}
    </>
  );
};

const Footer = () => (
  <footer className="py-24 px-6 border-t border-white/5 relative z-10 bg-black text-white">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
      <div className="md:col-span-2 space-y-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <span className="text-2xl font-extrabold tracking-tighter text-white">VALEUM</span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        </div>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
          AI-First Growth Partner. Transformamos data cruda en revenue predecible y escalable.
        </p>
      </div>
      <div className="space-y-6 text-center md:text-left">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Navegación</h5>
        <ul className="space-y-3 text-sm text-gray-500">
          <li><Link to="/#servicios" className="hover:text-white transition-colors">Servicios</Link></li>
          <li><Link to="/jobs" className="hover:text-white transition-colors">Trabaja con nosotros</Link></li>
          <li><Link to="/#contacto" className="hover:text-white transition-colors">Match</Link></li>
        </ul>
      </div>
      <div className="space-y-6 text-center md:text-left">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ecosistema</h5>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="hover:text-white transition-colors cursor-pointer">LinkedIn</li>
          <li className="hover:text-white transition-colors cursor-pointer">Youtube</li>
          <li className="hover:text-white transition-colors cursor-pointer">Instagram</li>
          <li className="hover:text-white transition-colors cursor-pointer">Facebook</li>
          <li className="hover:text-white transition-colors cursor-pointer">Podcast</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-medium">
      <span>© {new Date().getFullYear()} Valeum. AI-First Growth Partner.</span>
      <span>Science over Luck.</span>
    </div>
  </footer>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
        <ScrollToHash />
        
        {/* Background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <Routes>
            <Route path="/" element={
              <>
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[160px] bg-animate bg-blue-600/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[160px] bg-animate bg-purple-600/10 transition-colors duration-1000" style={{ animationDelay: '3s' }}></div>
              </>
            } />
            <Route path="/jobs" element={
              <>
                <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[160px] bg-animate bg-purple-600/10 transition-colors duration-1000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[160px] bg-animate bg-blue-600/10 transition-colors duration-1000" style={{ animationDelay: '3s' }}></div>
              </>
            } />
          </Routes>
        </div>

        <Header />

        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </main>

        <Footer />

        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </BrowserRouter>
  );
}