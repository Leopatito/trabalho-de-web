export interface AccountsResponse {
  items: Account[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface Account {
  id: number;
  dateCreated: string;
  lastUpdated: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  type: string;
  color: string;
  icon: string;
  isActive: boolean;
}