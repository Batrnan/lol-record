import { useState } from 'react';
import './MatchDetail.css';

const spellIdToName = {
  1: 'SummonerBoost',
  3: 'SummonerExhaust',
  4: 'SummonerFlash',
  6: 'SummonerHaste',
  7: 'SummonerHeal',
  11: 'SummonerSmite',
  12: 'SummonerTeleport',
  13: 'SummonerMana',
  14: 'SummonerDot',
  21: 'SummonerBarrier',
  30: 'SummonerPoroRecall',
  31: 'SummonerPoroThrow',
  32: 'SummonerSnowball',
  39: 'SummonerMark',
  54: 'Summoner_UltBookPlaceholder',
  55: 'Summoner_UltBookSmitePlaceholder',
};

const getSpellImg = (id) => {
  const name = spellIdToName[id];
  return name
    ? `https://ddragon.leagueoflegends.com/cdn/15.11.1/img/spell/${name}.png`
    : '';
};

const getItemImg = (id) =>
  `https://ddragon.leagueoflegends.com/cdn/15.11.1/img/item/${id}.png`;

const getChampImg = (name) =>
  `https://ddragon.leagueoflegends.com/cdn/15.11.1/img/champion/${name}.png`;

const getQueueName = (queueId) => {
  switch (queueId) {
    case 420:
      return '솔로랭크';
    case 430:
      return '일반';
    case 440:
      return '자유랭크';
    case 450:
      return '칼바람 나락';
    case 1700:
      return '아레나';
    default:
      return '기타';
  }
};

const MatchDetail = ({ match }) => {
  const [showDetail, setShowDetail] = useState(false);

  if (!match || !match.champion) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTeamTable = (team) => {
    const maxDamage = Math.max(...team.map((p) => p.damage));
    return (
      <table className="team-table">
        <thead>
          <tr>
            <th>소환사</th>
            <th>챔피언</th>
            <th>스펠</th>
            <th>KDA</th>
            <th>피해량</th>
            <th>와드</th>
            <th>CS</th>
            <th>아이템</th>
          </tr>
        </thead>
        <tbody>
          {team.map((p, idx) => (
            <tr
              key={idx}
              className={p.name === match.name ? 'highlight-player' : ''}
            >
              <td
                style={{
                  width: '150px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.name}
              </td>
              <td>
                <div
                  className="champion-cell"
                  style={{
                    width: '130px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <img
                    src={getChampImg(p.champion)}
                    alt={p.champion}
                    className="champion-icon"
                  />
                  <span>{p.champion}</span>
                </div>
              </td>
              <td className="spell-gap">
                {p.spells?.spell1Id && (
                  <img
                    src={getSpellImg(p.spells.spell1Id)}
                    alt="spell1"
                    width="20"
                  />
                )}
                {p.spells?.spell2Id && (
                  <img
                    src={getSpellImg(p.spells.spell2Id)}
                    alt="spell2"
                    width="20"
                  />
                )}
              </td>
              <td>{p.kda}</td>
              <td>
                {p.damage}
                <div className="damage-bg">
                  <div
                    className="damage-bar"
                    style={{ width: `${(p.damage / maxDamage) * 100}%` }}
                  ></div>
                </div>
              </td>
              <td>{p.vision}</td>
              <td>{p.cs}</td>
              <td className="item-list">
                {p.items.map(
                  (item, idx) =>
                    item !== 0 && (
                      <img
                        key={idx}
                        src={getItemImg(item)}
                        alt={`item${item}`}
                        width="24"
                        className="item-icon"
                      />
                    )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div
        className={`match-summary ${match.win ? 'win' : 'lose'}`}
        onClick={() => setShowDetail(!showDetail)}
      >
        <div className="champion-wrap">
          <img
            src={getChampImg(match.champion)}
            alt={match.champion}
            width="48"
            className="champion-icon"
          />
          <div className="champion-level">{match.level}</div>
        </div>
        <div className="summary-content">
          <div className="champion-name">
            {match.champion} <span>{match.kda}</span>
          </div>

          <div>
            CS: {match.cs} / 피해량: {match.damage}
          </div>
        </div>
        <div className="spells-box">
          {match.spells?.spell1Id && (
            <img
              src={getSpellImg(match.spells.spell1Id)}
              alt="spell1"
              width="24"
              className="spell-icon"
            />
          )}
          {match.spells?.spell2Id && (
            <img
              src={getSpellImg(match.spells.spell2Id)}
              alt="spell2"
              width="24"
              className="spell-icon"
            />
          )}
        </div>
      </div>

      {showDetail && (
        <div className="team-details">
          <div className="match-info">
            <span className="match-mode">{getQueueName(match.queueId)}</span>
            <span className="match-time">
              {formatTime(match.gameStartTimestamp)}
            </span>
          </div>
          <h4>아군</h4>
          {renderTeamTable(match.teams.ally)}
          <h4>적군</h4>
          {renderTeamTable(match.teams.enemy)}
        </div>
      )}
    </div>
  );
};

export default MatchDetail;
