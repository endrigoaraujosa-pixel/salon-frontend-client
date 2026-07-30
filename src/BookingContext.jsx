import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState({
    servicos: [],       // [{ id, nome, duracao_minutos, valor, categoria_nome }]
    profissional: null, // { id, nome, foto } | null = qualquer
    data: null,         // 'YYYY-MM-DD'
    hora: null,         // 'HH:MM'
    cliente: { nome: '', telefone: '' },
    solicitacaoId: null,
  });
  const [config, setConfig] = useState({ ocultar_valores_online: false });

  const updateBooking = (patch) => setBooking(prev => ({ ...prev, ...patch }));
  const updateConfig = (patch) => setConfig(prev => ({ ...prev, ...patch }));

  const resetBooking = () => setBooking({
    servicos: [], profissional: null, data: null, hora: null,
    cliente: { nome: '', telefone: '' },
    solicitacaoId: null,
  });

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking, config, updateConfig }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
