import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, User } from 'lucide-react';
import api from '../api';
import { useBooking } from '../BookingContext';
import { useToast } from '../useToast';

const STEPS = 4;

export default function Profissional() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { showToast, ToastEl } = useToast();

  const [loading, setLoading] = useState(true);
  const [profissionais, setProfissionais] = useState([]);
  const [selected, setSelected] = useState(booking.profissional?.id || null);

  useEffect(() => {
    if (booking.servicos.length === 0) {
      navigate('/servicos');
      return;
    }
    api.get('/online/profissionais')
      .then(r => setProfissionais(r.data || []))
      .catch(() => showToast('Erro ao carregar profissionais.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    const prof = selected ? profissionais.find(p => p.id === selected) : null;
    updateBooking({ profissional: prof || null });
    navigate('/data-hora');
  };

  return (
    <div className="page">
      {ToastEl}

      <button className="back-btn" onClick={() => navigate('/servicos')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="steps-bar">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`step-dot ${i < 2 ? (i === 1 ? 'active' : 'done') : ''}`} />
        ))}
      </div>

      <div className="page-header" style={{ marginTop: 12 }}>
        <span className="label">Passo 2 de 4</span>
        <h1>Profissional</h1>
        <p>Escolha quem vai te atender, ou deixe em branco para qualquer profissional disponível.</p>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          Carregando profissionais...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px' }}>
          {/* Qualquer profissional */}
          <button
            className={`selectable-card ${!selected ? 'selected' : ''}`}
            onClick={() => setSelected(null)}
          >
            <div className="check-dot">
              {!selected && <Check size={13} strokeWidth={3} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="prof-avatar" style={{ background: 'var(--surface-2)' }}>
                <User size={20} color="var(--text-muted)" />
              </div>
              <div>
                <div className="card-title">Qualquer profissional</div>
                <div className="card-sub">Primeiro disponível no horário escolhido</div>
              </div>
            </div>
          </button>

          {profissionais.length > 0 && (
            <div className="section-title" style={{ padding: '8px 0 4px', fontSize: 11 }}>
              Ou escolha um profissional
            </div>
          )}

          {profissionais.map(p => {
            const isSelected = selected === p.id;
            const initials = p.nome?.charAt(0).toUpperCase();
            return (
              <button
                key={p.id}
                className={`selectable-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelected(isSelected ? null : p.id)}
              >
                <div className="check-dot">
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="prof-avatar">
                    {p.foto ? <img src={p.foto} alt={p.nome} /> : initials}
                  </div>
                  <div>
                    <div className="card-title">{p.nome}</div>
                    {p.cargo && <div className="card-sub">{p.cargo}</div>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="bottom-bar">
        <button className="btn btn-primary btn-full" onClick={handleNext}>
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
