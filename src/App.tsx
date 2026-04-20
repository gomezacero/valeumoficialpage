import React, { useState, useEffect, useRef, useCallback, createContext, useContext, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from "./pages/Home";
import { initAnalyticsLazy } from "./firebase";

const Jobs = lazy(() => import("./pages/Jobs"));

// Toast Context
type ToastType = 'success' | 'error' | 'info';
interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const Toast = ({ message, type = 'success', onClose }: { message: string, type?: ToastType, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" size={18} />,
    error: <AlertCircle className="text-red-400" size={18} />,
    info: <Info className="text-blue-400" size={18} />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(8px)' }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]"
    >
      <div className="gorilla-glass px-6 py-4 flex items-center gap-4 border border-white/10 shadow-2xl">
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="text-sm font-medium text-white/90">{message}</p>
        <button onClick={onClose} className="ml-auto text-white/40 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

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
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    navRef.current.style.setProperty('--mouse-x', `${x}%`);
    navRef.current.style.setProperty('--mouse-y', `${y}%`);
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
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${scrolled ? 'py-4' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            ref={navRef}
            onMouseMove={handleMouseMove}
            className={`gorilla-glass rounded-full px-8 py-3 transition-all duration-700 ${scrolled ? 'gorilla-glass-scrolled' : ''
              }`}
            initial={false}
            animate={{
              borderColor: scrolled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
            }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Capa de luz que sigue el cursor */}
            <div className="gorilla-glass-light" />

            {/* Contenido del navbar */}
            <div className="gorilla-glass-content">
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => handleNav('/')}>
                <img src="/valeum-logo.png" alt="Valeum" width="90" height="20" className="h-5 w-auto object-contain" />
              </div>

              <nav className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <button onClick={() => handleNav('/', '#servicios')} className="hover:text-white transition-colors">Servicios</button>
                <button onClick={() => handleNav('/jobs')} className={`hover:text-white transition-colors ${location.pathname === '/jobs' ? 'text-white' : ''}`}>Careers</button>
                <button onClick={() => handleNav('/', '#contacto')} className="text-white bg-white/10 px-6 py-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">Match</button>
              </nav>

              <button className="md:hidden p-2 text-white" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl pt-32 px-10 md:hidden">
          <div className="flex flex-col gap-10 text-4xl font-extrabold tracking-tighter text-white">
            <button onClick={() => handleNav('/', '#servicios')} className="text-left hover:text-blue-500 transition-colors">Servicios</button>
            <button onClick={() => handleNav('/jobs')} className="text-left hover:text-purple-500 transition-colors">Careers</button>
            <button onClick={() => handleNav('/', '#contacto')} className="text-left text-blue-500 underline underline-offset-8">Match</button>
          </div>
          <button className="absolute top-8 right-6 p-2 text-white" onClick={() => setIsMenuOpen(false)} aria-label="Cerrar menú"><X size={32} /></button>
        </div>
      )}
    </>
  );
};

const Footer = () => (
  <footer className="py-24 px-6 relative z-10 bg-black text-white liquid-footer">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
      <div className="md:col-span-2 space-y-6 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <img src="/valeum-logo.png" alt="Valeum" width="160" height="36" className="h-9 w-auto object-contain" />
        </div>
        <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
          AI-First Growth Partner. Transformamos data cruda en revenue predecible y escalable.
        </p>
      </div>
      <div className="space-y-6 text-center md:text-left">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Navegación</h5>
        <ul className="space-y-4 text-sm text-gray-500">
          <li><Link to="/#servicios" className="hover:text-blue-400 transition-colors duration-300">Servicios</Link></li>
          <li><Link to="/jobs" className="hover:text-blue-400 transition-colors duration-300">Trabaja con nosotros</Link></li>
          <li><Link to="/#contacto" className="hover:text-blue-400 transition-colors duration-300">Match</Link></li>
        </ul>
      </div>
      <div className="space-y-6 text-center md:text-left">
        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Ecosistema</h5>
        <ul className="space-y-4 text-sm text-gray-500">
          <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">LinkedIn</li>
          <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Youtube</li>
          <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Instagram</li>
          <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Facebook</li>
          <li className="hover:text-blue-400 transition-colors duration-300 cursor-pointer">Podcast</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 uppercase tracking-widest font-medium">
      <div className="liquid-divider w-full absolute left-0 right-0" />
      <span className="pt-8">© {new Date().getFullYear()} Valeum. AI-First Growth Partner.</span>
      <span className="pt-8">Science over Luck.</span>
    </div>
  </footer>
);

export default function App() {
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    initAnalyticsLazy();
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <BrowserRouter>
        <div className="min-h-screen bg-black text-white selection:bg-blue-500 selection:text-white">
          <ScrollToHash />

          {/* Background decoration - manchas difusas para que backdrop-filter distorsione */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(0,120,255,0.12), transparent 40%), radial-gradient(circle at 80% 30%, rgba(140,0,255,0.08), transparent 35%), radial-gradient(circle at 50% 80%, rgba(0,60,160,0.06), transparent 40%)'
          }}>
            <Routes>
              <Route path="/" element={
                <>
                  <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] bg-blue-500/15 transition-colors duration-1000"></div>
                  <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full blur-[120px] bg-purple-500/12 transition-colors duration-1000" style={{ animationDelay: '3s' }}></div>
                  <div className="absolute top-[40%] left-[50%] w-[25%] h-[25%] rounded-full blur-[100px] bg-cyan-500/6 transition-colors duration-1000" style={{ animationDelay: '5s' }}></div>
                </>
              } />
              <Route path="/jobs" element={
                <>
                  <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[120px] bg-purple-500/15 transition-colors duration-1000"></div>
                  <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full blur-[120px] bg-blue-500/12 transition-colors duration-1000" style={{ animationDelay: '3s' }}></div>
                  <div className="absolute top-[40%] right-[30%] w-[25%] h-[25%] rounded-full blur-[100px] bg-cyan-500/6 transition-colors duration-1000" style={{ animationDelay: '5s' }}></div>
                </>
              } />
            </Routes>
          </div>

          <Header />

          <main className="relative z-10">
            <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/jobs" element={<Jobs />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />

          <AnimatePresence>
            {toast && (
              <Toast
                key="toast"
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
