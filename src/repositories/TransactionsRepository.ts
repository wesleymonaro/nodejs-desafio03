import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    let income = 0;
    let outcome = 0;
    let total = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.value;
        total += t.value;
      } else if (t.type === 'outcome') {
        outcome += t.value;
        total -= t.value;
      }
    });
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
