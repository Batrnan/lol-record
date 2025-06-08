const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

const userRouter = require('./routes/user');

app.use(cors());

app.use(express.json());

app.use('/user', userRouter);

app.listen(port, () => {
  console.log(`${port} 서버 실행..`);
});
