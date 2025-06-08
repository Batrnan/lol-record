import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './Home';
import SummonerList from './SummonerList';

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
