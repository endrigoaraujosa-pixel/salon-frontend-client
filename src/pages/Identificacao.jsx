import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, User, Phone, MessageSquare } from 'lucide-react';
import { useBooking } from '../BookingContext';
import { useToast } from '../useToast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STEPS = 4;

const fmtBRL = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}min` : ''}` : `${m}min`;

function formatPhone(v) {
  if (!v) return '';
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

export default function Identificacao() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { showToast, ToastEl } = useToast();

  const [nome, setNome] = useState(booking.cliente.nome);
  const [telefone, setTelefone] = useState(booking.cliente.telefone);
  const [obs, setObs] = useState(booking.observacoes || '');

  if (booking.servicos.length === 0) {
    navigate('/servicos');
    return null;
  }

  const totalMin = booking.servicos.reduce((a, s) => a + (s.duracao_minutos || 0), 0);
  const totalVal = booking.servicos.reduce((a, s) => a + Number(s.valor || 0), 0);

  const dataFmt = booking.data
    ? format(new Date(booking.data + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })
    : '';

  const handleNext = () => {
    if (!nome.trim()) { showToast('Informe seu nome.', 'error'); return; }
    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) { showToast('Informe um telefone válido com DDD.', 'error'); return; }

    updateBooking({ cliente: { nome: nome.trim(), telefone }, observacoes: obs });
    navigate('/sucesso');
  };

  return (
    <div className="page">
      {ToastEl}

      <button className="back-btn" onClick={() => navigate('/data-hora')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="steps-bar">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`step-dot ${i < 4 ? (i === 3 ? 'active' : 'done') : ''}`} />
        ))}
      </div>

      <div className="page-header" style={{ marginTop: 12 }}>
        <span className="label">Passo 4 de 4</span>
        <h1>Seus Dados</h1>
        <p>Precisamos de algumas informações para confirmar seu agendamento.</p>
      </div>

      {/* Resumo do pedido */}
      <div style={{ margin: '16px 20px 0', background: 'var(--brand-light)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
          Resumo do Pedido
        </div>
        {booking.servicos.map((s, i) => (
          <div key={i} style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span>{s.nome}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{fmtBRL(s.valor)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {booking.profissional && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              👤 {booking.profissional.nome}
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            📅 {dataFmt} às {booking.hora}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            ⏱ Duração estimada: {fmtMin(totalMin)}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand-deep)', fontFamily: 'var(--font-display)', marginTop: 4 }}>
            Total: {fmtBRL(totalVal)}
          </div>
        </div>
      </div>

      {/* Formulário */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '20px 20px 0' }}>
        <div className="form-group">
          <label className="form-label">
            <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Seu nome completo *
          </label>
          <input
            className="form-input"
            placeholder="Como devemos te chamar?"
            value={nome}
            onChange={e => setNome(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Phone size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            WhatsApp / Telefone *
          </label>
          <input
            className="form-input"
            placeholder="(XX) XXXXX-XXXX"
            value={telefone}
            onChange={e => setTelefone(formatPhone(e.target.value))}
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <MessageSquare size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Observações (opcional)
          </label>
          <textarea
            className="form-input"
            placeholder="Alguma preferência ou informação importante..."
            rows={3}
            value={obs}
            onChange={e => setObs(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>
      </div>

      <div className="bottom-bar">
        <button className="btn btn-primary btn-full btn-lg" onClick={handleNext}>
          Confirmar Pedido <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
