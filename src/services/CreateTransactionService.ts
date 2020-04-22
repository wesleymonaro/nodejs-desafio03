import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome')
      throw new AppError('Type must be income or outcome');

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value)
      throw new AppError('Not have suficient balance');

    let categorySearched = await categoriesRepository.findOne({
      title: category,
    });

    if (!categorySearched) {
      const createdCategory = categoriesRepository.create({ title: category });
      categorySearched = await categoriesRepository.save(createdCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categorySearched.id,
    });

    await transactionsRepository.save(transaction);

    transaction.category = categorySearched;
    delete transaction.category_id;

    return transaction;
  }
}

export default CreateTransactionService;
