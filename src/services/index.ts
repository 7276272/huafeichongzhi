
// Re-export all services from this central file
export * from './orderService';

// 从paymentService导出，并使用具名导出解决冲突
import * as PaymentService from './paymentService';
export { 
  getPaymentAddresses,
  // 明确命名以避免冲突
  createPaymentAddress as createWalletPaymentAddress,
  updatePaymentAddress as updateWalletPaymentAddress,
  deletePaymentAddress as deleteWalletPaymentAddress
} from './paymentService';

export * from './walletService';
export * from './userService';
export * from './orderManagement';
export * from './orderRefresh';
