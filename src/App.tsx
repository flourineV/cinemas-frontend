import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import './styles/globals.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}

export default App;
