import React from 'react';
import { Users, MapPin } from 'lucide-react';

export default function Jobs() {
  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Aplicación enviada al sistema de selección.');
  };

  const jobs = [
    {
      id: 'ai-media-buyer',
      title: 'AI Media Buyer Senior',
      department: 'Performance',
      type: 'Remoto',
      description: 'Gestión y optimización de presupuestos agresivos utilizando automatización e IA.'
    },
    {
      id: 'creative-technologist',
      title: 'Creative Technologist',
      department: 'Design',
      type: 'Remoto',
      description: 'Fusión entre diseño y tecnología para crear assets visuales dinámicos impulsados por data.'
    },
    {
      id: 'automation-engineer',
      title: 'Automation Engineer',
      department: 'Engineering',
      type: 'Remoto',
      description: 'Desarrollo de ecosistemas digitales nativos y sistemas autónomos que reducen fricción.'
    },
    {
      id: 'other',
      title: 'Open Application',
      department: 'General',
      type: 'Remoto',
      description: '¿Eres un talento atípico? Cuéntanos cómo aportarías valor al equipo.'
    }
  ];

  return (
    <div className="transition-page min-h-screen pt-52 pb-40 px-6 valeum-hero-container">
      <div className="max-w-7xl mx-auto hero-content-wrapper">
        <div className="text-center mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full apple-glass text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-10 mx-auto">
            <Users size={12} /> Estamos Contratando
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-10 leading-[1.05]">
            Construye el <span className="text-purple-500">Futuro.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Buscamos mentes atípicas. Si crees que el marketing tradicional está muerto, este es tu lugar. Aplica a nuestras posiciones abiertas.
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto mb-40">
          {jobs.map((j) => (
            <div key={j.id} className="group apple-glass p-10 rounded-[32px] hover:border-purple-500/40 transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full">{j.department}</span>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/> {j.type}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors mb-4 tracking-tight">{j.title}</h3>
                  <p className="text-gray-400 text-sm font-light max-w-xl leading-relaxed">{j.description}</p>
                </div>
                <button 
                  className="px-8 py-4 bg-white text-black font-black rounded-full text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
                  onClick={() => {
                    const el = document.getElementById('apply-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    const select = document.getElementById('role-select') as HTMLSelectElement;
                    if(select) select.value = j.id;
                  }}
                >
                  APLICAR
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Candidacy Form */}
        <div id="apply-form" className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tighter">Candidatura Abierta</h2>
            <p className="text-gray-500 font-light italic">Si tu visión hace match con la nuestra, te contactaremos pronto.</p>
          </div>
          <form className="apple-glass p-12 rounded-[40px] space-y-8" onSubmit={handleJobSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre Completo</label>
                <input type="text" placeholder="Tu nombre" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Correo Electrónico</label>
                <input type="email" placeholder="tu@email.com" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Posición de Interés</label>
              <select id="role-select" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors appearance-none">
                <option value="" disabled selected>Selecciona un rol</option>
                <option value="ai-media-buyer">AI Media Buyer Senior</option>
                <option value="creative-technologist">Creative Technologist</option>
                <option value="automation-engineer">Automation Engineer</option>
                <option value="other">Otro (Open Application)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">LinkedIn / Portfolio URL</label>
              <input type="url" placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">¿Por qué Valeum?</label>
              <textarea rows={4} placeholder="Cuéntanos por qué eres un talento atípico y qué aportarías al equipo." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required></textarea>
            </div>

            <button type="submit" className="w-full py-6 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] uppercase tracking-[0.2em] text-xs">ENVIAR APLICACIÓN</button>
          </form>
        </div>
      </div>
    </div>
  );
}