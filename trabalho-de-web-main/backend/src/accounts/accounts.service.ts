import { Injectable } from '@nestjs/common';
import { BaseService } from '@shared/services/base.service';
import { Account } from './entities/account.entity';
import { AppContextService } from '@shared/services/app-context.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountHasTransactionsException } from '@exceptions/account-has-transactions.exception';

@Injectable({})
export class AccountsService extends BaseService<Account> {
  constructor(
    @InjectRepository(Account)
    protected readonly repository: Repository<Account>,
    protected appContext: AppContextService,
  ) {
    super(repository, appContext);
  }

  // Atualizar propriedades de uma conta, removendo inicial balance se houver transações
  async update(id: number, updateDto: Partial<Account>): Promise<Account> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    // Se a conta tiver transações, não podemos atualizar o campo 'initialBalance'
    if (account && account.transactions && account.transactions.length > 0) {
      delete updateDto.initialBalance;
    }

    return super.update(id, updateDto);
  }

  // Remover uma conta se ela não tiver transações associadas
  async remove(id: number): Promise<void> {
    const account = await this.repository.findOne({
      where: { id },
      relations: ['transactions'],
    });

    // Verifica se a conta tem transações associadas
    if (account && account.transactions && account.transactions.length > 0) {
      throw new AccountHasTransactionsException();
    }

    await super.remove(id);
  }

  async updateBalance(accountRef: { id: number }, amount: number): Promise<Account> {
    if (!accountRef || typeof accountRef.id !== 'number') {
      throw new Error('Parâmetro inválido: era esperado um objeto { id: number }');
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('O valor enviado para atualizar o saldo não é um número válido.');
    }

    const account = await this.repository.findOne({
      where: { id: accountRef.id },
    });

    if (!account) {
      throw new Error('Conta não encontrada');
    }

    // Garante que sempre será number
    account.currentBalance = Number(account.currentBalance ?? 0);

    // Aplica o valor
    account.currentBalance += amount;

    // Salva e retorna
    return await this.repository.save(account);
  }
}
