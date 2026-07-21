import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronLeft, CalendarDays, Clock } from 'lucide-react';
import api from '../api';
import { useBooking } from '../BookingContext';
import { useToast } from '../useToast';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isToday, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STEPS = 4;
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function DataHora() {
  const navigate = useNavigate();
  const { booking, updateBooking } = useBooking();
  const { showToast, ToastEl } = useToast();

  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(booking.data ? new Date(booking.data + 'T12:00:00') : null);
  const [selectedHora, setSelectedHora] = useState(booking.hora || null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (booking.servicos.length === 0) {
      navigate('/servicos');
    }
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setSelectedHora(null);
    setSlots([]);
    setLoadingSlots(true);

    const servicoIds = booking.servicos.map(s => s.id);
    const params = new URLSearchParams();
    params.append('data', dateStr);
    servicoIds.forEach(id => params.append('servicos', id));
    if (booking.profissional?.id) params.append('profissional_id', booking.profissional.id);

    api.get(`/online/disponibilidade?${params.toString()}`)
      .then(r => setSlots(r.data?.horarios || []))
      .catch(() => showToast('Erro ao buscar horários disponíveis.', 'error'))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(monthCursor);
    const end = endOfMonth(monthCursor);
    const days = eachDayOfInterval({ start, end });
    const startPad = start.getDay(); // 0 = Sun
    const padded = Array(startPad).fill(null).concat(days);
    // pad to complete last row
    while (padded.length % 7 !== 0) padded.push(null);
    return padded;
  }, [monthCursor]);

  const today = startOfDay(new Date());
  const isPastDay = (d) => d && isBefore(startOfDay(d), today);
  const isSelectedDay = (d) => d && selectedDate && format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

  const handleNext = () => {
    if (!selectedDate) { showToast('Selecione uma data.', 'error'); return; }
    if (!selectedHora) { showToast('Selecione um horário.', 'error'); return; }
    updateBooking({
      data: format(selectedDate, 'yyyy-MM-dd'),
      hora: selectedHora,
    });
    navigate('/identificacao');
  };

  const totalMin = booking.servicos.reduce((a, s) => a + (s.duracao_minutos || 0), 0);
  const fmtMin = (m) => m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}min` : ''}` : `${m}min`;

  return (
    <div className="page">
      {ToastEl}

      <button className="back-btn" onClick={() => navigate('/profissional')}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="steps-bar">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`step-dot ${i < 3 ? (i === 2 ? 'active' : 'done') : ''}`} />
        ))}
      </div>

      <div className="page-header" style={{ marginTop: 12 }}>
        <span className="label">Passo 3 de 4</span>
        <h1>Data e Horário</h1>
        <p>
          {booking.servicos.length} serviço(s) · Duração estimada: <strong>{fmtMin(totalMin)}</strong>
        </p>
      </div>

      {/* Calendar */}
      <div className="calendar" style={{ marginTop: 16 }}>
        <div className="calendar-header">
          <button
            className="cal-nav-btn"
            onClick={() => setMonthCursor(m => subMonths(m, 1))}
            disabled={format(monthCursor, 'yyyy-MM') <= format(new Date(), 'yyyy-MM')}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="month-name">
            {format(monthCursor, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button className="cal-nav-btn" onClick={() => setMonthCursor(m => addMonths(m, 1))}>
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="weekdays">
          {WEEKDAYS.map(d => <div key={d} className="weekday-label">{d}</div>)}
        </div>

        <div className="days-grid">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={idx} className="day-cell empty" />;
            const past = isPastDay(day);
            const todayDay = isToday(day);
            const sel = isSelectedDay(day);
            return (
              <button
                key={idx}
                className={`day-cell ${past ? 'disabled' : ''} ${todayDay && !sel ? 'today' : ''} ${sel ? 'selected' : ''}`}
                onClick={() => !past && setSelectedDate(day)}
                disabled={past}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div style={{ marginTop: 24 }}>
          <div className="section-title" style={{ padding: '0 20px 10px' }}>
            <CalendarDays size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            Horários disponíveis em {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </div>

          {loadingSlots ? (
            <div className="loading-center" style={{ padding: 24 }}>
              <div className="spinner" />
              Buscando horários...
            </div>
          ) : slots.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 20px' }}>
              <Clock size={32} />
              <p>Nenhum horário disponível nesta data.<br />Tente outro dia.</p>
            </div>
          ) : (
            <div className="time-slots">
              {slots.map(h => (
                <button
                  key={h}
                  className={`time-slot ${selectedHora === h ? 'selected' : ''}`}
                  onClick={() => setSelectedHora(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bottom-bar">
        <button
          className="btn btn-primary btn-full"
          onClick={handleNext}
          disabled={!selectedDate || !selectedHora}
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
