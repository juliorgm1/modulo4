import express from 'express';
import { accountModel } from '../model/accountModel.js';

const app = express();
const TARIFA_SAQUE = 1;
const TARIFA_TRANSFERENCIA = 8;

// 4 QUESTÃO
app.patch('/deposito/:agencia/:conta/:balance', async (req, res) => {
  try {
    const agencia = Number.parseInt(req.params.agencia);
    const conta = Number.parseInt(req.params.conta);
    const balance = Number.parseFloat(req.params.balance);

    if (!agencia || !conta || !balance) throw new Error('Parametros inválidos');

    const account = await accountModel.findOne({ agencia, conta });

    if (!account) throw new Error('A conta não existe');

    account.balance += balance;

    await account.save();

    res.send(account);
  } catch (error) {
    res.status(400).send(error);
  }
});

// 5 QUESTAO
app.patch('/saque/:agencia/:conta/:valor', async (req, res) => {
  try {
    const { agencia, conta } = req.params;
    const valor = Number.parseFloat(req.params.valor);

    if (!agencia || !conta || !valor) throw new Error('Parametros inválidos');

    const account = await accountModel.findOne({ agencia, conta });

    if (!account) throw new Error('Agencia ou conta inexistente');
    if (account.balance < valor + TARIFA_SAQUE)
      throw new Error('Saldo insuficiente!');

    account.balance -= valor + TARIFA_SAQUE;

    await account.save();

    res.send(account);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// 6 QUESTAO
app.get('/saldo/:agencia/:conta', async (req, res) => {
  try {
    const { agencia, conta } = req.params;

    if (!agencia || !conta) throw new Error('Parametros inválidos');

    const account = await accountModel.findOne({ agencia, conta });

    if (!account) throw new Error('Conta inexistente');

    res.send(JSON.stringify(account.balance));
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// 7 QUESTAO
app.delete('/account/:agencia/:conta', async (req, res) => {
  try {
    const { agencia, conta } = req.params;

    validateParams([agencia, conta]);

    if (!(await accountModel.deleteOne({ agencia, conta })))
      throw new Error('Erro ao excluir conta');

    const accounts = await accountModel.find({ agencia });

    res.send(JSON.stringify(accounts.length));
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//8 QUESTAO
http: app.patch(
  '/transferencia/:contaOrigem/:contaDestino/:valor',
  async (req, res) => {
    try {
      const { contaOrigem, contaDestino } = req.params;
      let valor = Number.parseFloat(req.params.valor);

      validateParams([contaOrigem, contaDestino]);

      const accountOrigem = await accountModel.findOne({ conta: contaOrigem });
      const accountDestino = await accountModel.findOne({
        conta: contaDestino,
      });

      if (!accountOrigem) throw new Error('Conta de origem não encontrada');
      if (!accountDestino) throw new Error('Conta de destino não encontrada');

      if (accountOrigem.agencia !== accountDestino.agencia)
        valor += TARIFA_TRANSFERENCIA;
      validateBalance(accountOrigem.balance, valor);

      accountOrigem.balance -= valor;
      accountDestino.balance += valor;

      await accountOrigem.save();
      await accountDestino.save();
      res.send(JSON.stringify(accountOrigem.balance));
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

//9 QUESTAO
app.get('/averageAgency/:agencia', async (req, res) => {
  try {
    const agencia = Number(req.params.agencia);
    validateParams([agencia]);

    const average = await accountModel.aggregate([
      { $match: { agencia } },
      { $group: { _id: '$agencia', avg: { $avg: '$balance' } } },
    ]);

    if (average.length === 0) throw new Error('Agencia não encontrada');

    res.send(average);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//10 QUESTAO
app.get('/accounts/:quantity', async (req, res) => {
  try {
    const quantity = Number(req.params.quantity);
    validateParams([quantity]);

    const accounts = await accountModel
      .find()
      .limit(quantity)
      .sort({ balance: 'asc', name: 'asc' });
    if (!accounts) throw new Error('Nenhuma conta encontrada');

    res.send(accounts);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//11 QUESTAO
app.get('/riches/:quantity', async (req, res) => {
  try {
    const quantity = Number(req.params.quantity);
    validateParams([quantity]);

    const riches = await accountModel
      .find()
      .limit(quantity)
      .sort({ balance: -1, name: 'asc' });

    if (!riches) throw new Error('Não há amor em $P...');

    res.send(riches);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

//12 QUESTAO
app.put('/private', async (req, res) => {
  try {
    const agencies = await accountModel.distinct('agencia');
    let listOfClientVips = [];

    for (let i = 0; i < agencies.length; i++) {
      const agency = agencies[i];

      const vipClient = await accountModel
        .findOne({ agencia: agency })
        .sort({ balance: -1 });
      if (vipClient) {
        const { agencia, conta } = vipClient;
        await accountModel.deleteOne({ agencia, conta });
        vipClient.agencia = 99;
        listOfClientVips.push(vipClient);
      }
    }

    await accountModel.insertMany(listOfClientVips);
    const clientsVips = await accountModel.find({ agencia: 99 });

    if (!clientsVips) throw new Error('Clientes vips não encontrados');

    res.send(clientsVips);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/accounts', async (req, res) => {
  try {
    const accounts = await accountModel.find({});
    res.send(accounts);
  } catch (error) {
    res.status(400).send(error);
  }
});

function validateParams(params) {
  params.forEach((param) => {
    if (!param) throw new Error('Parametro invalido!');
  });
}

function validateBalance(balance, saque) {
  if (balance < saque)
    throw new Error('Saldo insuficiente para realizar essa operação!');
}
// app.patch();
// app.delete();

export { app as accountRouter };
