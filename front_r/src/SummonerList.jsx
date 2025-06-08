import axios from 'axios';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const SummonerList = () => {
  const { region, name, tag } = useParams();

  const getMatchList = async () => {
    axios
      .get(`http://localhost:8080/user/matches`, {
        params: {
          region,
          name,
          tag,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    getMatchList();
  }, [region, name, tag]);

  return (
    <>
      <div>SummonerList</div>
      <div>
        {region}, {name}, {tag}
      </div>
    </>
  );
};

export default SummonerList;
