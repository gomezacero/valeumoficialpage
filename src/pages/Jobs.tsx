import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { addFirestoreDoc, logAnalyticsEvent } from '../firebase';
import { useToast } from '../App';

const ALLOWED_ROLES = new Set(['ai-media-buyer', 'creative-technologist', 'automation-engineer', 'other']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_EMAIL = 200;
const MAX_URL = 500;
const MAX_REASON = 2000;

export default function Jobs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleJobSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const role = String(formData.get('role') ?? '').trim();
    const linkedin = String(formData.get('linkedin') ?? '').trim();
    const reason = String(formData.get('reason') ?? '').trim();

    if (!name || !email || !linkedin || !reason) {
      showToast('Por favor completa todos los campos requeridos.', 'error');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showToast('Ingresa un correo electrónico válido.', 'error');
      return;
    }
    if (!ALLOWED_ROLES.has(role)) {
      showToast('Selecciona un rol válido.', 'error');
      return;
    }
    if (
      name.length > MAX_NAME ||
      email.length > MAX_EMAIL ||
      linkedin.length > MAX_URL ||
      reason.length > MAX_REASON
    ) {
      showToast('Alguno de los campos excede el límite permitido.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await addFirestoreDoc('job_applications', { name, email, role, linkedin, reason });
      showToast('Aplicación enviada al sistema de selección.');
      form.reset();
      void logAnalyticsEvent('form_submit', { form_name: 'job_application', role });
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error al enviar la aplicación:', error);
      showToast('Hubo un error al enviar tu aplicación. Por favor, inténtalo de nuevo.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="transition-page min-h-screen pt-52 pb-40 px-6 valeum-hero-container">
      <div className="max-w-7xl mx-auto hero-content-wrapper">
        <div className="text-center mb-20">
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
                <input name="name" type="text" placeholder="Tu nombre" maxLength={MAX_NAME} autoComplete="name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Correo Electrónico</label>
                <input name="email" type="email" placeholder="tu@email.com" maxLength={MAX_EMAIL} autoComplete="email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Posición de Interés</label>
              <select id="role-select" name="role" required defaultValue="" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors appearance-none [&>option]:bg-[#0a0f1a] [&>option]:text-white">
                <option value="" disabled>Selecciona un rol</option>
                <option value="ai-media-buyer">AI Media Buyer Senior</option>
                <option value="creative-technologist">Creative Technologist</option>
                <option value="automation-engineer">Automation Engineer</option>
                <option value="other">Otro (Open Application)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">LinkedIn / Portfolio URL</label>
              <input name="linkedin" type="url" placeholder="https://" maxLength={MAX_URL} autoComplete="url" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">¿Por qué Valeum?</label>
              <textarea name="reason" rows={4} maxLength={MAX_REASON} placeholder="Cuéntanos por qué eres un talento atípico y qué aportarías al equipo." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500 text-sm text-white transition-colors" required></textarea>
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full py-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] uppercase tracking-[0.2em] text-xs">
              {isSubmitting ? 'ENVIANDO...' : 'ENVIAR APLICACIÓN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
