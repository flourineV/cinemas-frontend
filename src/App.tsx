import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Promotions from './pages/Promotions';
import Events from './pages/Events';
import DashboardWrapper from './components/layout/DashboardWrapper';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/events" element={<Events />} />
          <Route path="/dashboard" element={<DashboardWrapper />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
