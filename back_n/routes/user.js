const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();

const RIOT_API_KEY = 'RGAPI-606b41b4-c873-4b76-bf25-b9b520ea3475';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ 공통 에러 핸들링 미들웨어
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) =>
    res.status(500).json({ error: err.message })
  );

// ✅ API 함수들
const getUserPUUID = async (gameName, tagLine) => {
  try {
    const accountReponse = await axios.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    const puuid = accountReponse.data.puuid;

    const summonerResponse = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    return summonerResponse.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'PUUID 조회 실패');
  }
};

const getUserRank = async (puuid) => {
  try {
    const userRank = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    if (!userRank.data.length) throw new Error('랭크 정보 없음');
    return userRank.data[0];
  } catch (error) {
    throw new Error(error.response?.data?.message || '랭크 조회 실패');
  }
};

const getMatchIds = async (puuid, start, count) => {
  try {
    const res = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || '매치 ID 조회 실패');
  }
};

const getMatchSummaries = async (ids, puuid) => {
  const chunkSize = 5;
  const summaries = [];

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);

    const results = await Promise.allSettled(
      chunk.map(async (matchId) => {
        try {
          const res = await axios.get(
            `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            { headers: { 'X-Riot-Token': RIOT_API_KEY } }
          );
          const data = res.data;
          const player = data.info.participants.find((p) => p.puuid === puuid);
          if (!player) return null;

          return {
            matchId,
            championId: player.championId,
            champion: player.championName,
            level: player.champLevel,
            kda: `${player.kills} / ${player.deaths} / ${player.assists}`,
            win: player.win,
            items: [
              player.item0,
              player.item1,
              player.item2,
              player.item3,
              player.item4,
              player.item5,
              player.item6,
            ],
            name: player.riotIdGameName || player.summonerName,
            tag: player.riotIdTagline || '',
            position: player.individualPosition,
            cs: player.totalMinionsKilled,
            damage: player.totalDamageDealtToChampions,
            vision: player.visionScore,
            duration: data.info.gameDuration,
            gameMode: data.info.gameMode,
            queueId: data.info.queueId,
            gameStartTimestamp: data.info.gameStartTimestamp,
            spells: {
              spell1Id: player.summoner1Id,
              spell2Id: player.summoner2Id,
            },
            runes: {
              primaryStyle: player.perks.styles.find(
                (style) => style.description === 'primaryStyle'
              ),
              subStyle: player.perks.styles.find(
                (style) => style.description === 'subStyle'
              ),
              statPerks: player.perks.statPerks,
            },
            teams: {
              ally: data.info.participants
                .filter((p) => p.teamId === player.teamId)
                .map((p) => ({
                  name: p.riotIdGameName || p.summonerName,
                  champion: p.championName,
                  items: [
                    p.item0,
                    p.item1,
                    p.item2,
                    p.item3,
                    p.item4,
                    p.item5,
                    p.item6,
                  ],
                  spells: {
                    spell1Id: p.summoner1Id,
                    spell2Id: p.summoner2Id,
                  },
                  runes: {
                    primaryStyle: p.perks.styles.find(
                      (style) => style.description === 'primaryStyle'
                    ),
                    subStyle: p.perks.styles.find(
                      (style) => style.description === 'subStyle'
                    ),
                    statPerks: p.perks.statPerks,
                  },
                  kda: `${p.kills}/${p.deaths}/${p.assists}`,
                  cs: p.totalMinionsKilled,
                  damage: p.totalDamageDealtToChampions,
                  vision: p.visionScore,
                  position: p.individualPosition,
                })),
              enemy: data.info.participants
                .filter((p) => p.teamId !== player.teamId)
                .map((p) => ({
                  name: p.riotIdGameName || p.summonerName,
                  champion: p.championName,
                  items: [
                    p.item0,
                    p.item1,
                    p.item2,
                    p.item3,
                    p.item4,
                    p.item5,
                    p.item6,
                  ],
                  spells: {
                    spell1Id: p.summoner1Id,
                    spell2Id: p.summoner2Id,
                  },
                  runes: {
                    primaryStyle: p.perks.styles.find(
                      (style) => style.description === 'primaryStyle'
                    ),
                    subStyle: p.perks.styles.find(
                      (style) => style.description === 'subStyle'
                    ),
                    statPerks: p.perks.statPerks,
                  },
                  kda: `${p.kills}/${p.deaths}/${p.assists}`,
                  cs: p.totalMinionsKilled,
                  damage: p.totalDamageDealtToChampions,
                  vision: p.visionScore,
                  position: p.individualPosition,
                })),
            },
          };
        } catch (error) {
          console.error(
            `match ${matchId} 에러: `,
            error.response?.data || error.message
          );
          return null;
        }
      })
    );

    summaries.push(
      ...results
        .filter((r) => r.status === 'fulfilled' && r.value)
        .map((r) => r.value)
    );
    await delay(1500);
  }

  return summaries;
};

// ✅ 라우터 핸들러들
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { name, tag } = req.query;
    const data = await getUserPUUID(name, tag);
    res.json(data);
  })
);

router.get(
  '/rank',
  asyncHandler(async (req, res) => {
    const { name, tag } = req.query;
    const userInfo = await getUserPUUID(name, tag);
    const rank = await getUserRank(userInfo.puuid);
    res.json(rank);
  })
);

router.get(
  '/matches',
  asyncHandler(async (req, res) => {
    const { name, tag } = req.query;
    const userInfo = await getUserPUUID(name, tag);
    const ids = await getMatchIds(userInfo.puuid, 0, 20);
    const summaries = await getMatchSummaries(ids, userInfo.puuid);
    res.json(summaries);
  })
);

module.exports = router;
