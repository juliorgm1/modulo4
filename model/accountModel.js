import moongose from 'mongoose';
//{"agencia":10,"conta": 1001 ,"name":"Maria Roberta Fernandes","balance":587}
const accountSchema = moongose.Schema({
  agencia: field(Number, true),
  conta: field(Number, true),
  name: field(String, true),
  balance: field(Number, true),
});

function field(type, require) {
  return {
    type: type,
    requery: require,
  };
}

const accountModel = moongose.model('accounts', accountSchema, 'accounts');

export { accountModel };
