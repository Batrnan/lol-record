import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div>
      <select value={region} onChange={(e) => setRegion(e.target.value)}>
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
      />
      <input
        type="text"
        value={tag}
        placeholder="KR1"
        onChange={(e) => setTag(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
};

export default Home;
