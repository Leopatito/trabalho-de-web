import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Account } from './entities/account.entity';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountHasTransactionsException } from '@exceptions/account-has-transactions.exception';

@Injectable()
export class AccountsService extends BaseService<Account> {
  constructor(
    @InjectRepository(Account)
    protected readonly repository: Repository<Account>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  /**
   * Atualiza conta com regras:
   * - Se houver transações, não permite editar o saldo inicial.
   * - Remove campos undefined do DTO para não sobrescrever valores.
   * - Aplica manualmente os campos no objeto carregado.
   */
  async update(id: number, updateDto: any): Promise<Account> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Se a conta tiver transações, não permite alterar o saldo inicial
    if (account.transactions?.length > 0) {
      delete updateDto.initialBalance;
    }

    // Remove campos undefined para não limpar dados no banco
    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key] === undefined) {
        delete updateDto[key];
      }
    });

    // Aplica manualmente os campos no objeto existente
    Object.assign(account, updateDto);

    return this.repository.save(account);
  }

  /**
   * Exclusão somente se não houver transações.
   */
  async remove(id: number): Promise<void> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    if (account && account.transactions && account.transactions.length > 0) {
      throw new AccountHasTransactionsException();
    }

    await super.remove(id);
  }

  /**
   * Atualiza balanço da conta.
   */
  async updateBalance(
    idOrAccount: number | Account,
    amount: number,
  ): Promise<Account> {
    const account =
      typeof idOrAccount === 'number'
        ? await this.findOne(idOrAccount)
        : idOrAccount;

    account.currentBalance += amount;
    return this.repository.save(account);
  }
}
