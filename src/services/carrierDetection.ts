
import { CarrierType } from "@/types";

// Helper function to detect carrier from phone number prefix
export const detectCarrier = (phoneNumber: string): CarrierType | null => {
  const prefix = phoneNumber.substring(0, 3);
  
  // This is simplified logic - in a real app, you would have more comprehensive carrier detection
  if (['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '178', '182', '183', '184', '187', '188'].includes(prefix)) {
    return "中国移动";
  } else if (['130', '131', '132', '155', '156', '185', '186', '145', '146', '166', '175', '176'].includes(prefix)) {
    return "中国联通";
  } else if (['133', '153', '177', '180', '181', '189', '173', '174', '199'].includes(prefix)) {
    return "中国电信";
  }
  
  return null;
};

// Export function for getting phone carrier
export const getPhoneCarrier = async (phoneNumber: string): Promise<CarrierType | null> => {
  // For now, just use the local detection function
  // In a real app, you might want to verify this with an API
  return detectCarrier(phoneNumber);
};

// Generate a unique order ID
export const generateOrderId = (): string => {
  const prefix = "ord";
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomNum}-${timestamp}`;
};
