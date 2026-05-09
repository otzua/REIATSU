import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Watch from './pages/Watch';
import AnimeDetails from './pages/AnimeDetails';
import Layout from './components/Layout';

function App() {
  return (
    <div className="app">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/watch/:id" element={<Watch />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
