import { useNavigate } from 'react-router-dom';
import { Scissors, CalendarDays, User, Clock, ChevronRight } from 'lucide-react';
import { useBooking } from '../BookingContext';

export default function Home() {
  const navigate = useNavigate();
  const { config } = useBooking();
  const nomeEmpresa = config?.nome_fantasia?.trim();

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      <div className="home-hero">
        <div className="home-logo">
          <Scissors size={36} color="#6F9189" strokeWidth={2} />
        </div>

        <div>
          {nomeEmpresa && (
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-deep)', marginBottom: 6, textAlign: 'center' }}>
              {nomeEmpresa}
            </div>
          )}
          <h1 className="home-title">Agendar<br />Horário</h1>
          <p className="home-subtitle" style={{ marginTop: 10 }}>
            Escolha seu serviço, profissional e horário em poucos passos.
          </p>
        </div>

        <div className="home-steps" style={{ marginTop: 4 }}>
          <div className="home-step">
            <div className="home-step-num">1</div>
            <span className="home-step-text">Escolha os serviços desejados</span>
          </div>
          <div className="home-step">
            <div className="home-step-num">2</div>
            <span className="home-step-text">Selecione o profissional (opcional)</span>
          </div>
          <div className="home-step">
            <div className="home-step-num">3</div>
            <span className="home-step-text">Escolha a data e o horário</span>
          </div>
          <div className="home-step">
            <div className="home-step-num">4</div>
            <span className="home-step-text">Confirme seus dados e aguarde</span>
          </div>
        </div>

        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={() => navigate('/servicos')}
          style={{ marginTop: 8 }}
        >
          Começar Agendamento
          <ChevronRight size={20} />
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Seu pedido será confirmado após aprovação {nomeEmpresa ? `de ${nomeEmpresa}` : 'do salão'}.
        </p>
      </div>
    </div>
  );
}
