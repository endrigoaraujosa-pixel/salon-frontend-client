import { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState({
    servicos: [],       // [{ id, nome, duracao_minutos, valor, categoria_nome }]
    profissional: null, // { id, nome, foto } | null = qualquer
    data: null,         // 'YYYY-MM-DD'
    hora: null,         // 'HH:MM'
    cliente: { nome: '', telefone: '' },
  });

  const updateBooking = (patch) => setBooking(prev => ({ ...prev, ...patch }));

  const resetBooking = () => setBooking({
    servicos: [], profissional: null, data: null, hora: null,
    cliente: { nome: '', telefone: '' },
  });

  return (
    <BookingContext.Provider value={{ booking, updateBooking, resetBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
