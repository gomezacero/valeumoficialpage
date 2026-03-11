import React from 'react';
import { ArrowRight, Globe, Sparkles, BarChart3, Activity, ShieldCheck, Target, Layers, Zap, Cpu, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
      <section id="hero" className="valeum-hero-container pt-60 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center hero-content-wrapper">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-10 mx-auto">
            <Sparkles size={12} className="animate-pulse" /> AI-First Growth Partner
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-10 leading-[1.05]">
            <span className="text-gradient">Escalamos tu negocio al ritmo de la</span><br />
            <span className="opacity-80">Inteligencia Artificial.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed font-light">
            No competimos, dominamos. Ponemos a tu servicio el conocimiento de nuestros casos de éxito. Transformamos data cruda en revenue predecible y escalable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a 
              href="#contacto"
              className="group px-10 py-5 bg-white text-black font-black rounded-full flex items-center gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all"
            >
              EVALUAR MATCH <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#servicios"
              className="px-10 py-5 rounded-full font-black border border-white/10 hover:bg-white/5 transition-colors flex items-center justify-center text-sm"
            >
              VER SERVICIOS
            </a>
          </div>
        </div>
      </section>

      {/* Authority Section - DATOS CLAVE */}
      <section className="py-20 px-6 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: 'Inversión Gestionada', value: '+$50M', icon: <BarChart3 className="text-blue-500" /> },
            { label: 'Incremento en ROAS', value: '3x', icon: <Activity className="text-emerald-500" /> },
            { label: 'Optimización Algorítmica', value: '24/7', icon: <ShieldCheck className="text-purple-500" /> },
            { label: 'Talento y Expertise', value: 'Top 1%', icon: <Target className="text-orange-500" /> }
          ].map((stat, i) => (
            <div key={i} className="group apple-glass p-8 rounded-[32px] border border-white/5 hover:border-white/20 transition-all duration-500">
              <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-5xl font-black mb-2 tracking-tighter text-white">
                {stat.value}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee FOMO */}
      <div className="w-full apple-glass border-x-0 py-10 overflow-hidden relative z-20">
        <div className="flex gap-16 whitespace-nowrap animate-[scroll_40s_linear_infinite]">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-6 text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase">
               <Globe size={14} /> EL MERCADO NO ESPERA 
               <span className="text-white/20">/</span>
               SÓLO 2 NUEVOS PARTNERS
               <span className="text-white/20">/</span>
               RESULTADOS DESPROPORCIONADOS
               <span className="text-white/20">/</span>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <section id="servicios" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 text-center md:text-left">
            <h2 className="text-4xl md:text-7xl font-extrabold mb-8 tracking-tighter">Servicios para <span className="text-blue-500">Escalar.</span></h2>
            <p className="text-gray-400 text-lg max-w-xl font-light leading-relaxed">Sistemas impulsados por experiencia humana, talento de élite e Inteligencia Artificial para dominar mercados.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group p-10 apple-glass rounded-[32px] hover:border-blue-500/40 transition-all duration-700">
                <div className="mb-8 p-4 bg-white/5 rounded-2xl w-fit group-hover:bg-blue-500/10 transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold mb-5 tracking-tight">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 font-light">{s.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorar <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Matching Section */}
      <section id="contacto" className="py-40 px-6 bg-gradient-to-b from-transparent to-blue-900/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">¿Hacemos <span className="text-blue-500">Match?</span></h2>
            <p className="text-gray-400 text-lg font-light">No trabajamos con cualquiera. Cuéntanos tu desafío y evaluaremos si tenemos el ancho de banda y la convicción para escalarlo.</p>
          </div>
          <form className="apple-glass p-10 md:p-16 rounded-[40px] space-y-8" onSubmit={handleMatchSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre Completo</label>
                <input type="text" placeholder="Tu nombre" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-sm text-white" required />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Empresa / URL</label>
                <input type="text" placeholder="tudominio.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-sm text-white" required />
              </div>
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Presupuesto Mensual de Inversión</label>
                <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-sm appearance-none text-white">
                  <option value="" disabled selected>Selecciona un rango</option>
                  <option value="10k-50k">$10k - $50k USD</option>
                  <option value="50k-100k">$50k - $100k USD</option>
                  <option value="100k+">$100k+ USD</option>
                </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tu Desafío Principal</label>
              <textarea rows={4} placeholder="¿Qué te impide escalar hoy? Sé directo y específico." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all text-sm text-white" required></textarea>
            </div>
            <button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] uppercase tracking-[0.2em] text-xs">Enviar Solicitud de Match</button>
            <p className="text-xs text-gray-500 text-center font-medium">Revisamos todas las solicitudes en 24 horas. Si hay fit, agendamos una llamada de 15 minutos.</p>
          </form>
        </div>
      </section>

    </div>
  );
}