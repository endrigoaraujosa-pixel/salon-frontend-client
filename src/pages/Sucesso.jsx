import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, AlertCircle } from 'lucide-react';
import api from '../api';
import { useBooking } from '../BookingContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Sucesso() {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (submittedRef.current) return;
    if (booking.servicos.length === 0 && !confirmedBooking) {
      navigate('/');
      return;
    }
    if (!confirmedBooking) {
      submittedRef.current = true;
      enviar();
    }
  }, []);

  const enviar = async () => {
    setStatus('loading');
    try {
      const dataHora = `${booking.data}T${booking.hora}:00`;
      const payload = {
        cliente_nome: booking.cliente.nome,
        telefone: booking.cliente.telefone,
        data_hora: dataHora,
        servicos: booking.servicos.map(s => ({
          servico_id: s.id,
          servico_nome: s.nome,
          colaborador_id: booking.profissional?.id || null,
          colaborador_nome: booking.profissional?.nome || null,
        })),
        profissional_id: booking.profissional?.id || null,
        observacoes: booking.observacoes || '',
      };

      await api.post('/online/solicitar', payload);
      setConfirmedBooking(booking);
      setStatus('success');
      resetBooking();
    } catch (e) {
      setErrorMsg(e.response?.data?.detail || 'Não foi possível enviar sua solicitação. Tente novamente.');
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, paddingBottom: 0 }}>
        <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600 }}>Enviando sua solicitação...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', gap: 20, padding: '40px 24px', paddingBottom: 0, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={40} color="#DC2626" />
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            Ocorreu um erro
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {errorMsg}
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 8 }}
          onClick={() => navigate('/identificacao')}
        >
          Tentar novamente
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const activeBooking = confirmedBooking || booking;

  const dataFmt = activeBooking.data
    ? format(new Date((activeBooking.data || new Date().toISOString().slice(0,10)) + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })
    : '';

  return (
    <div className="page" style={{ alignItems: 'center', justifyContent: 'flex-start', padding: '40px 24px 100px', gap: 0 }}>

      {/* Success icon with animation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', textAlign: 'center', animation: 'slideUp 0.5s ease' }}>
        <div className="success-icon" style={{ width: 96, height: 96 }}>
          <CheckCircle2 size={52} strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Pedido Enviado!
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
            Sua solicitação foi recebida com sucesso. Em breve, o salão confirmará seu agendamento.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div style={{
        width: '100%',
        marginTop: 28,
        background: 'var(--brand-light)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
          Detalhes do Pedido
        </div>

        <div className="summary-row">
          <span className="summary-label">Data</span>
          <span className="summary-value" style={{ textTransform: 'capitalize' }}>{dataFmt}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Horário</span>
          <span className="summary-value">{activeBooking.hora || '--:--'}</span>
        </div>
        {activeBooking.profissional && (
          <div className="summary-row">
            <span className="summary-label">Profissional</span>
            <span className="summary-value">{activeBooking.profissional.nome}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-label">Serviços</span>
          <span className="summary-value">
            {(activeBooking.servicos || []).map(s => s.nome).join(', ') || '—'}
          </span>
        </div>
      </div>

      {/* Info box */}
      <div style={{
        width: '100%',
        marginTop: 16,
        background: '#FFFBEB',
        border: '1.5px solid #FDE68A',
        borderRadius: 'var(--radius)',
        padding: '14px 16px',
        fontSize: 13,
        color: '#92400E',
        lineHeight: 1.5,
      }}>
        ⏳ <strong>Aguardando aprovação:</strong> O salão analisará sua solicitação e entrará em contato pelo telefone <strong>{activeBooking.cliente?.telefone || ''}</strong> para confirmar.
      </div>

      {/* CTA */}
      <div style={{ width: '100%', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-outline btn-full" onClick={() => navigate('/')}>
          <Home size={16} /> Fazer novo agendamento
        </button>
      </div>

    </div>
  );
}
