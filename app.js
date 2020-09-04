import express from 'express';
import { accountRouter } from './routes/accountRouter.js';
import mongoose from 'mongoose';
// Conectando ao mongoose
(async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://juliorgm:estragobirobaldo@cluster0.qlsjp.mongodb.net/atividade-pratica?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );

    console.log('conectou no mongose');
  } catch (error) {
    console.log(error);
  }
})();

const app = express();

app.use(express.json());
app.use(accountRouter);

app.listen(3000, () => {
  console.log('Api started...');
});
