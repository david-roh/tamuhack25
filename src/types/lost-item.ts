export interface LostItem {
  _id: string;
  claimToken: string;
  itemName: string;
  itemDescription: string;
  status: 'unclaimed' | 'claimed' | 'shipped';
  // ... other fields ...
} 