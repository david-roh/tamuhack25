export interface PaymentIntent {
  id: string;
  status: 'succeeded' | 'failed';
  amount: number;
}

export async function createPaymentIntent(amount: number): Promise<PaymentIntent> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock payment processor - always succeeds
  return {
    id: `pi_${Math.random().toString(36).substring(2)}`,
    status: 'succeeded',
    amount
  };
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock payment confirmation - always succeeds
  return {
    id: paymentIntentId,
    status: 'succeeded',
    amount: 999 // $9.99
  };
} 