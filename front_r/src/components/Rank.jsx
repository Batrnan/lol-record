import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Rank.css';

const Rank = () => {
  const { region, name, tag } = useParams();
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRankInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/user/rank', {
        params: {
          region,
          name,
          tag,
        },
      });
      setRankData(res.data);
    } catch (error) {
      console.error('랭크 정보 불러오기 실패: ', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierImg = (tier) => {
    if (!tier) return '';
    return `/${tier.toLowerCase()}.png`;
  };

  useEffect(() => {
    getRankInfo();
  }, [region, name, tag]);

  if (loading) {
    return (
      <div className="rank-box">
        <div className="loading-container">
          <div className="spinner" />
          <div className="loading-text">랭크 정보 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!rankData) {
    return (
      <div className="rank-box">
        <h2>
          {name}#{tag}
        </h2>
        랭크 정보 없음
      </div>
    );
  }

  return (
    <div
      className="rank-box"
      onClick={() =>
        window.open(`https://op.gg/lol/summoners/kr/${name}-${tag}`, '_blank')
      }
    >
      <div className="rank-player">
        {name}#{tag}
      </div>

      <img
        src={getTierImg(rankData.tier)}
        alt={rankData.tier}
        className="tier-icon"
      />

      <div className="rank-tier">
        {rankData.tier} {rankData.rank}
      </div>

      <div className="rank-stats">
        <div className="stat-card">
          LP
          <span>{rankData.leaguePoints} LP</span>
        </div>
        <div className="stat-card">
          승<span>{rankData.wins}</span>
        </div>
        <div className="stat-card">
          패<span>{rankData.losses}</span>
        </div>
      </div>
    </div>
  );
};

export default Rank;
