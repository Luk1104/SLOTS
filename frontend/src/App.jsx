import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Game from "./pages/Game";
import Login from "./pages/Login";
import Register from './pages/Register';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/" element={<Login />} />
        <Route path="/" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
