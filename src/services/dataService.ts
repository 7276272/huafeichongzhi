
// This file provides backward compatibility for components still importing from dataService
// It re-exports functions from the new service files

export { 
  createOrder, 
  detectCarrier, 
  rechargeOptions,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getDashboardStats
} from './orderService';

export {
  getPaymentAddresses,
  createPaymentAddress,
  updatePaymentAddress,
  deletePaymentAddress
} from './paymentService';

export {
  getWalletTransactions,
  getWalletTransactionsByUserId,
  createWalletTransaction,
  updateWalletTransaction,
  getUserWallets,
  getUserWalletByUserId
} from './walletService';

export {
  getUsers,
  createUser,
  deleteUser
} from './userService';
