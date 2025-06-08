const { default: axios } = require('axios');
const express = require('express');
const router = express.Router();

const RIOT_API_KEY = 'RGAPI-bdff3104-a1bb-4c47-bab1-615e64bb4402';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getUserPUUID = async (gameName, tagLine) => {
  try {
    const accountReponse = await axios.get(
      `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );
    const puuid = accountReponse.data.puuid;

    const summonerResponse = await axios.get(
      `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );
    return summonerResponse.data;
  } catch (error) {
    console.error(
      'Error fetching data: ',
      error.response ? error.response.data : error.message
    );
  }
};

const getUserRank = async (puuid) => {
  try {
    const userRank = await axios.get(
      `https://kr.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );
    return userRank.data[0];
  } catch (error) {
    console.error(
      'Error fetching data: ',
      error.response ? error.response.data : error.message
    );
  }
};

const getMatchIds = async (puuid, start, count) => {
  try {
    const ids_res = await axios.get(
      `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`,
      {
        headers: {
          'X-Riot-Token': RIOT_API_KEY,
        },
      }
    );

    return ids_res.data;
  } catch (error) {
    console.error(
      'Error fetching data: ',
      error.response ? error.response.data : error.message
    );
  }
};

const getMatchSummaries = async (ids, puuid) => {
  const chunkSize = 5;
  const summaries = [];

  // 1초에 최대 20번이 제한이여서 꼼수 쓰기. 5개씬 나눠서 요청
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, (i += chunkSize));

    const results = await Promise.allSettled(
      chunk.map(async (matchId) => {
        try {
          const res = await axios.get(
            `https://asia.api.riotgames.com/lol/match/v5/matches/${matchId}`,
            {
              headers: {
                'X-Riot-Token': RIOT_API_KEY,
              },
            }
          );
          const data = res.data;
          const player = data.info.participants.find((p) => p.puuid === puuid);

          if (!player) {
            console.error(`PUUID ${puuid} not found in match ${matchId}`);
            return null;
          }

          return {
            matchId,
            championId: player.championId,
            champion: player.championName,
            level: player.champLevel,
            kda: `${player.kills}/${player.deaths}/${player.assists}`,
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
            `Error fetching match ${matchId} : `,
            error.response ? error.response.data : error.message
          );
        }
      })
    );
    summaries.push(
      ...results
        .filter((result) => result.status !== 'rejected')
        .map((r) => r.value || r)
    );

    await delay(1500);
  }

  return summaries;
};

router.get('/', async (req, res) => {
  const { region, name, tag } = req.query;
  res.json(await getUserPUUID(name, tag));
});

router.get('/rank', async (req, res) => {
  const { region, name, tag } = req.query;
  let userInfo = await getUserPUUID(name, tag);
  res.json(await getUserRank(userInfo.puuid));
});

router.get('/matches', async (req, res) => {
  const { region, name, tag } = req.query;
  const userInfo = await getUserPUUID(name, tag);
  const ids = await getMatchIds(userInfo.puuid, 0, 20);
  res.json(await getMatchSummaries(ids, userInfo.puuid));
});

module.exports = router;
