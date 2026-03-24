import React, { lazy, Suspense } from 'react';
import { ArrowRight, Globe, Sparkles, BarChart3, Activity, ShieldCheck, Target, Layers, Zap, Cpu, Code, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const WaveBackground = lazy(() => import('../components/WaveBackground'));

export default function Home() {
  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Solicitud de Match enviada. Nos pondremos en contacto en 24 horas.');
  };

  const services = [
    {
      icon: <Target className="w-8 h-8 text-blue-400" />,
      title: "Performance a Gran Escala",
      desc: "Algoritmos entrenados para ROAS asimétrico. Compramos media donde tu competencia aún no sabe mirar, optimizando en tiempo real con modelos predictivos."
    },
    {
      icon: <Layers className="w-8 h-8 text-purple-400" />,
      title: "Diseño para Escalar",
      desc: "Creatividad impulsada por data y respaldada por un equipo experto. Generamos assets dinámicos que iteran automáticamente para maximizar conversión a escala global."
    },
    {
      icon: <Zap className="w-8 h-8 text-emerald-400" />,
      title: "Consultoría Estratégica",
      desc: "Auditamos, reestructuramos y preparamos tu ecosistema digital para la era de la automatización. Estrategia pura, cero fluff."
    },
    {
      icon: <Cpu className="w-8 h-8 text-orange-400" />,
      title: "Automatización de Servicios",
      desc: "Sistemas autónomos que reducen fricción, eliminan cuellos de botella y operan 24/7. Tu negocio, funcionando en piloto automático."
    },
    {
      icon: <Code className="w-8 h-8 text-pink-400" />,
      title: "Creación de Aplicaciones",
      desc: "Desarrollo de ecosistemas digitales nativos. Construimos productos que retienen usuarios y monetizan desde el día uno."
    }
  ];

  return (
    <div className="transition-page">
      {/* Hero Section */}
      <section id="hero" className="relative pt-60 pb-32 px-6 overflow-hidden" style={{ backgroundColor: '#000b1a' }}>
        {/* Wave Background WebGL (lazy loaded, fallback CSS en mobile) */}
        <Suspense fallback={<div className="absolute inset-0 valeum-hero-container" />}>
          <WaveBackground className="z-[1]" />
        </Suspense>
        {/* Overlay gradiente para transicion suave al siguiente bloque */}
        <div className="absolute inset-0 z-[2] pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent 50%, #000b1a 95%, #000 100%)'
        }} />
        <div className="max-w-7xl mx-auto text-center hero-content-wrapper">
          <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-glass text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-10 mx-auto"
          >
            <Sparkles size={12} className="animate-pulse" /> AI-First Growth Partner
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-extrabold tracking-tight mb-10 leading-[1.05]"
          >
            <span className="text-gradient">Escalamos tu negocio al ritmo de la</span><br />
            <span className="opacity-80">Inteligencia Artificial.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed font-light"
          >
            No competimos, dominamos. Ponemos a tu servicio el conocimiento de nuestros casos de éxito. Transformamos data cruda en revenue predecible y escalable.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <a
              href="#contacto"
              className="liquid-button group px-10 py-5 bg-white text-black font-black rounded-full flex items-center gap-3 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
            >
              EVALUAR MATCH <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#servicios"
              className="liquid-button px-10 py-5 rounded-full font-black border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all flex items-center justify-center text-sm"
            >
              VER SERVICIOS
            </a>
          </motion.div>
        </div>
      </section>

      {/* Authority Section - DATOS CLAVE */}
      <section className="py-20 px-6 relative z-20">
        {/* Halos difusos detras de las cards para que el glass distorsione algo */}
        <div className="liquid-glow w-[500px] h-[500px] bg-blue-500/15 -left-[10%] top-[-10%]" />
        <div className="liquid-glow w-[400px] h-[400px] bg-purple-500/12 -right-[5%] bottom-[-10%]" style={{ animationDelay: '4s' }} />
        <div className="liquid-glow w-[300px] h-[300px] bg-cyan-500/8 left-[40%] top-[20%]" style={{ animationDelay: '6s' }} />
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 relative z-10">
          {[
            { label: 'Inversión Gestionada', value: '+$50M', icon: <BarChart3 className="text-blue-500" /> },
            { label: 'Incremento en ROAS', value: '3x', icon: <Activity className="text-emerald-500" /> },
            { label: 'Optimización Algorítmica', value: '24/7', icon: <ShieldCheck className="text-purple-500" /> },
            { label: 'Talento y Expertise', value: 'Top 1%', icon: <Target className="text-orange-500" /> }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group liquid-glass noise-texture p-8 rounded-[28px]"
            >
              <div className="noise-layer rounded-[28px]" />
              <div className="liquid-glass-content">
                <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-5xl font-black mb-2 tracking-tighter text-white stat-glow">
                  {stat.value}
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Marquee FOMO - Liquid Glass */}
      <div className="w-full liquid-marquee py-10 overflow-hidden relative z-20">
        <div className="flex gap-16 whitespace-nowrap animate-[scroll_40s_linear_infinite]">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-[10px] font-black tracking-[0.5em] text-gray-400 uppercase">
               <Globe size={14} className="text-blue-500/60" /> EL MERCADO NO ESPERA
               <span className="text-blue-500/20">●</span>
               SÓLO 2 NUEVOS PARTNERS
               <span className="text-purple-500/20">●</span>
               RESULTADOS DESPROPORCIONADOS
               <span className="text-blue-500/20">●</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid - Liquid Glass */}
      <section id="servicios" className="py-40 px-6 relative">
        {/* Halos difusos detras para dar contexto visual al glass */}
        <div className="liquid-glow w-[600px] h-[600px] bg-blue-500/12 left-[15%] top-[5%]" />
        <div className="liquid-glow w-[500px] h-[500px] bg-purple-500/10 right-[5%] bottom-[10%]" style={{ animationDelay: '3s' }} />
        <div className="liquid-glow w-[350px] h-[350px] bg-emerald-500/6 left-[50%] bottom-[30%]" style={{ animationDelay: '6s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-24 text-center md:text-left"
          >
            <h2 className="text-4xl md:text-7xl font-extrabold mb-8 tracking-tighter">Servicios para <span className="text-blue-500">Escalar.</span></h2>
            <p className="text-gray-400 text-lg max-w-xl font-light leading-relaxed">Sistemas impulsados por experiencia humana, talento de élite e Inteligencia Artificial para dominar mercados.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group liquid-glass-iridescent noise-texture p-10 rounded-[28px]"
              >
                <div className="noise-layer rounded-[28px]" />
                <div className="liquid-glass-content">
                  <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-blue-500/10 transition-colors duration-500">
                    {s.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-5 tracking-tight">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light">{s.desc}</p>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-1">
                    Explorar <ChevronRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Matching Section - Liquid Glass */}
      <section id="contacto" className="py-40 px-6 relative">
        {/* Halos difusos para el form glass */}
        <div className="liquid-glow w-[600px] h-[600px] bg-blue-500/12 left-[5%] top-[15%]" />
        <div className="liquid-glow w-[450px] h-[450px] bg-purple-500/10 right-[0%] top-[35%]" style={{ animationDelay: '5s' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">¿Hacemos <span className="text-blue-500">Match?</span></h2>
            <p className="text-gray-400 text-lg font-light">No trabajamos con cualquiera. Cuéntanos tu desafío y evaluaremos si tenemos el ancho de banda y la convicción para escalarlo.</p>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="liquid-glass-form p-10 md:p-16 rounded-[40px] space-y-8 relative"
            onSubmit={handleMatchSubmit}
          >
            <div className="liquid-glass-content space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre Completo</label>
                  <input type="text" placeholder="Tu nombre" className="liquid-input w-full rounded-2xl px-6 py-5 text-sm text-white" required />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Empresa / URL</label>
                  <input type="text" placeholder="tudominio.com" className="liquid-input w-full rounded-2xl px-6 py-5 text-sm text-white" required />
                </div>
              </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Presupuesto Mensual de Inversión</label>
                  <select required className="liquid-input w-full rounded-2xl px-6 py-5 text-sm appearance-none text-white">
                    <option value="" disabled selected>Selecciona un rango</option>
                    <option value="10k-50k">$10k - $50k USD</option>
                    <option value="50k-100k">$50k - $100k USD</option>
                    <option value="100k+">$100k+ USD</option>
                  </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tu Desafío Principal</label>
                <textarea rows={4} placeholder="¿Qué te impide escalar hoy? Sé directo y específico." className="liquid-input w-full rounded-2xl px-6 py-5 text-sm text-white" required></textarea>
              </div>
              <button type="submit" className="liquid-button w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase tracking-[0.2em] text-xs">
                Enviar Solicitud de Match
              </button>
              <p className="text-xs text-gray-500 text-center font-medium">Revisamos todas las solicitudes en 24 horas. Si hay fit, agendamos una llamada de 15 minutos.</p>
            </div>
          </motion.form>
        </div>
      </section>

    </div>
  );
}