export interface Account {
  id?: number;               
  name: string;              
  type: 'checking' | 'savings' | 'investment' | 'cash' | 'other'; 
  initialBalance: number;    
  currentBalance?: number;   
  notes?: string;            
  transactions?: any[];
  userId?: number;
  isActive: boolean;        
}
