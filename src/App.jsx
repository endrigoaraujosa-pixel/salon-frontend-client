import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './BookingContext';
import Home from './pages/Home';
import Servicos from './pages/Servicos';
import Profissional from './pages/Profissional';
import DataHora from './pages/DataHora';
import Identificacao from './pages/Identificacao';
import Sucesso from './pages/Sucesso';

function App() {
  return (
    <BookingProvider>
      <div className="app-shell">
        <BrowserRouter>
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/servicos"      element={<Servicos />} />
            <Route path="/profissional"  element={<Profissional />} />
            <Route path="/data-hora"     element={<DataHora />} />
            <Route path="/identificacao" element={<Identificacao />} />
            <Route path="/sucesso"       element={<Sucesso />} />
            <Route path="*"              element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </BookingProvider>
  );
}

export default App;
