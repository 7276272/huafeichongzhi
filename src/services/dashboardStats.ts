
import { DashboardStats } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const statsPromises = [
    // Get total recharges count
    supabase.from('recharge_orders').select('count').single(),
    
    // Get pending recharges count
    supabase.from('recharge_orders').select('count').eq('status', 'pending').single(),
    
    // Get completed recharges count
    supabase.from('recharge_orders').select('count').eq('status', 'completed').single(),
    
    // Get failed recharges count
    supabase.from('recharge_orders').select('count').eq('status', 'failed').single(),
    
    // Get sum of all amounts
    supabase.from('recharge_orders').select('amount').then(
      result => {
        if (result.data && Array.isArray(result.data)) {
          return result.data.reduce((sum: number, item: any) => sum + item.amount, 0);
        }
        return 0;
      }
    ),
  ];

  try {
    const [total, pending, completed, failed, amount] = await Promise.all(statsPromises);
    
    return {
      totalRecharges: total.data?.count || 0,
      pendingRecharges: pending.data?.count || 0,
      completedRecharges: completed.data?.count || 0,
      failedRecharges: failed.data?.count || 0,
      totalAmount: amount || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalRecharges: 0,
      pendingRecharges: 0,
      completedRecharges: 0,
      failedRecharges: 0,
      totalAmount: 0,
    };
  }
};
