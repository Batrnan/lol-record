import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ className = 'home-center' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [region, setRegion] = useState('KR');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');

  const handleSearch = () => {
    if (!name || !tag) {
      alert('이름과 태그를 입력하세요.');
      return;
    }
    navigate(`/match/${region}/${name}/${tag}`);
  };

  const isRootPath = location.pathname === '/';

  return (
    <div className={className}>
      {isRootPath && <div className="home-logo">Sjae.GG</div>}
      <form
        className="search-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="region-select"
        >
          <option value="KR">KR</option>
          <option value="NA">NA</option>
          <option value="EUW">EUW</option>
          <option value="JP">JP</option>
        </select>
        <input
          type="text"
          value={name}
          placeholder="소환사 이름"
          onChange={(e) => setName(e.target.value)}
          className="name-input"
        />
        <input
          type="text"
          value={tag}
          placeholder="KR1"
          onChange={(e) => setTag(e.target.value)}
          className="tag-input"
        />
        <button type="submit" className="search-button">
          검색
        </button>
      </form>
    </div>
  );
};

export default Home;
