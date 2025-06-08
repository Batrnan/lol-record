import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Home from './Home';
import Rank from './Rank';
import MatchDetail from './MatchDetail';
import './SummonerList.css';

const SummonerList = () => {
  const { region, name, tag } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getMatchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/user/matches`, {
        params: {
          region,
          name,
          tag,
        },
      });
      setMatches(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatchList();
  }, [region, name, tag]);

  return (
    <div>
      <header className="match-header">
        <div className="logo" onClick={() => navigate('/')}>
          Sjae.GG
        </div>
      </header>
      <Home className="home-top" />
      <Rank />
      <div className="match-cover">
        {loading ? (
          <div className="matches-loading">
            <div className="spinner" />
            <div className="loading-text">매치 데이터 불러오는 중...</div>
          </div>
        ) : (
          matches.length > 0 &&
          matches.map((match, idx) => <MatchDetail key={idx} match={match} />)
        )}
      </div>
    </div>
  );
};

export default SummonerList;
