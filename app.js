import express from 'express';
import { accountRouter } from './routes/accountRouter.js';
import mongoose from 'mongoose';
// Conectando ao mongoose
(async () => {
  try {
    const connection_string = `mongodb+srv://${process.env.USERDB}:
                              ${process.env.PWDDB}
                              @cluster0.qlsjp.mongodb.net/${process.env.DATABASE}?
                              retryWrites=true&w=majority`;
    await mongoose.connect(connection_string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

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
