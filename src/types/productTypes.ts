import { RechargeProduct } from './index';

// 金额选项类型
export interface AmountOption {
  value: number;
  discount?: number;
}

// 为RechargeProduct类型扩展元数据字段
export interface ProductWithAmountOptions extends RechargeProduct {
  metadata?: {
    amount_options?: AmountOption[];
  };
  // 客户端使用，不存储到数据库
  amount_options?: AmountOption[];
}
