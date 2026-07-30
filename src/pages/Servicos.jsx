import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Check, Scissors, Clock, X } from 'lucide-react';
import api from '../api';
import { useBooking } from '../BookingContext';
import { useToast } from '../useToast';

const fmtBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}min` : ''}` : `${m}min`;

const STEPS = 4;

export default function Servicos() {
  const navigate = useNavigate();
  const { booking, updateBooking, config, updateConfig } = useBooking();
  const { showToast, ToastEl } = useToast();

  const [loading, setLoading] = useState(true);
  const [disabledError, setDisabledError] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [catFilter, setCatFilter] = useState('all');
  const [selected, setSelected] = useState(booking.servicos.map(s => s.id));

  useEffect(() => {
    Promise.all([
      api.get('/online/servicos'),
      api.get('/online/categorias'),
      api.get('/online/config').catch(() => ({ data: {} })),
    ])
      .then(([sRes, cRes, cfgRes]) => {
        setServicos(sRes.data || []);
        setCategorias(cRes.data || []);
        if (cfgRes.data) updateConfig(cfgRes.data);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setDisabledError(err.response.data?.detail || 'O Agendamento Online está desabilitado para este salão.');
        } else {
          showToast('Erro ao carregar serviços.', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (s) => {
    setSelected(prev =>
      prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      showToast('Selecione pelo menos um serviço.', 'error');
      return;
    }
    const selectedServicos = servicos.filter(s => selected.includes(s.id));
    updateBooking({ servicos: selectedServicos });
    navigate('/profissional');
  };

  const filtered = catFilter === 'all'
    ? servicos
    : servicos.filter(s => s.categoria_id === catFilter || (!s.categoria_id && catFilter === 'none'));

  const totalMin = selected.reduce((acc, id) => {
    const s = servicos.find(x => x.id === id);
    return acc + (s?.duracao_minutos || 0);
  }, 0);

  const totalVal = selected.reduce((acc, id) => {
    const s = servicos.find(x => x.id === id);
    return acc + Number(s?.valor || 0);
  }, 0);

  return (
    <div className="page">
      {ToastEl}

      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Steps bar */}
      <div className="steps-bar">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`step-dot ${i === 0 ? 'active' : ''}`} />
        ))}
      </div>

      <div className="page-header" style={{ marginTop: 12 }}>
        <span className="label">Passo 1 de 4</span>
        <h1>Serviços</h1>
        <p>Selecione o(s) serviço(s) que deseja agendar.</p>
      </div>

      {/* Category filter */}
      {!loading && categorias.length > 0 && (
        <div className="no-scrollbar" style={{ padding: '12px 20px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', gap: 8, width: 'max-content', paddingRight: 20 }}>
            <button
              className="btn btn-sm"
              style={{
                flexShrink: 0,
                borderRadius: 99,
                border: '1.5px solid',
                borderColor: catFilter === 'all' ? 'var(--brand)' : 'var(--border)',
                background: catFilter === 'all' ? 'var(--brand-light)' : 'transparent',
                color: catFilter === 'all' ? 'var(--brand-deep)' : 'var(--text-muted)',
                fontSize: 13,
              }}
              onClick={() => setCatFilter('all')}
            >Todos</button>
            {categorias.map(c => (
              <button
                key={c.id}
                className="btn btn-sm"
                style={{
                  flexShrink: 0,
                  borderRadius: 99,
                  border: '1.5px solid',
                  borderColor: catFilter === c.id ? 'var(--brand)' : 'var(--border)',
                  background: catFilter === c.id ? 'var(--brand-light)' : 'transparent',
                  color: catFilter === c.id ? 'var(--brand-deep)' : 'var(--text-muted)',
                  fontSize: 13,
                }}
                onClick={() => setCatFilter(c.id)}
              >{c.nome}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          Carregando serviços...
        </div>
      ) : disabledError ? (
        <div className="empty-state">
          <Scissors size={40} style={{ opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: 'var(--text-main, #333)', marginTop: 8 }}>{disabledError}</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted, #777)', marginTop: 4 }}>
            Entre em contato diretamente com o salão para realizar seu agendamento.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Scissors size={40} />
          <p>Nenhum serviço disponível para agendamento online no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 20px', paddingBottom: selected.length > 0 ? 8 : 16 }}>
          {filtered.map(s => {
            const isSelected = selected.includes(s.id);
            return (
              <button
                key={s.id}
                className={`selectable-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggle(s)}
              >
                <div className="check-dot">
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </div>
                <div className="card-title">{s.nome}</div>
                {s.categoria_nome && (
                  <div className="card-sub">{s.categoria_nome}</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="card-badge">
                    <Clock size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                    {fmtMin(s.duracao_minutos)}
                  </span>
                  {!config?.ocultar_valores_online && (
                    <span className="card-badge" style={{ background: 'white', border: '1px solid var(--border)' }}>
                      {fmtBRL(s.valor)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected summary strip */}
      {selected.length > 0 && (
        <div className="selected-tags">
          {selected.map(id => {
            const s = servicos.find(x => x.id === id);
            return s ? (
              <span key={id} className="tag">
                {s.nome}
                <button onClick={() => toggle(s)}><X size={12} /></button>
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* Bottom bar */}
      <div className="bottom-bar">
        {selected.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selected.length} serviço(s) · {fmtMin(totalMin)}
            </div>
            {!config?.ocultar_valores_online && (
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--brand-deep)', fontFamily: 'var(--font-display)' }}>
                {fmtBRL(totalVal)}
              </div>
            )}
          </div>
        )}
        <button
          className="btn btn-primary btn-full"
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
