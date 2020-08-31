import path from 'path';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

import uploadConfig from '../config/upload';
import loadCSV from '../utils/loadCSV';

interface Request {
  filename: string;
}

interface FileData {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const filePath = path.resolve(uploadConfig.directory, filename);

    const fileLines = await loadCSV({ filePath });

    const fileData: FileData[] = fileLines.map(line => ({
      title: line[0],
      type: line[1] as 'income' | 'outcome',
      value: Number(line[2]),
      category: line[3],
    }));

    // const transactions = await Promise.all(
    //   fileData.map(async ({ title, type, value, category }) => {
    //     const transaction = await createTransaction.execute({
    //       title,
    //       type,
    //       value,
    //       categoryTitle: category,
    //     });

    //     return Promise.resolve(transaction);
    //   }),
    // );

    const transactions: Transaction[] = [];

    for (const { title, type, value, category } of fileData) {
      transactions.push(
        await createTransaction.execute({
          title,
          type,
          value,
          categoryTitle: category,
        }),
      );
    }

    return transactions;
  }
}

export default ImportTransactionsService;
