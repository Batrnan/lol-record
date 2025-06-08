import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import SummonerList from './components/SummonerList';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:region/:name/:tag" element={<SummonerList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
