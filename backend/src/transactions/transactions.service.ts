/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseService } from '@shared/services/base.service';
import { AppContextService } from '@shared/services/app-context.service';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    protected readonly repository: Repository<Transaction>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  async create(createDto: DeepPartial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create(createDto);
    return this.repository.save(transaction);
  }

  async update(id: number, updateDto: DeepPartial<Transaction>): Promise<Transaction> {
    await this.repository.update(id, updateDto);

    const updated = await this.repository.findOne({ where: { id } });

    if (!updated) {
      throw new Error(`Transaction with id ${id} not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findByAccount(accountId: number): Promise<Transaction[]> {
  return this.repository.find({
    where: { account: { id: accountId } },
    order: { date: 'DESC' },
    relations: ['category', 'account'],
  });
  }

  find(options) {
    return this.repository.find(options);
  }
}
