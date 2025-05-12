
import React, { useEffect, useState } from "react";
import { getOrders, updateOrderStatus, refreshOrderPhoneInfo } from "@/services";
import { RechargeOrder } from "@/types";
import AdminLayout from "@/components/AdminLayout";
import OrdersTable from "@/components/admin/OrdersTable";
import OrderDetailDialog from "@/components/admin/OrderDetailDialog";
import SearchBar from "@/components/admin/SearchBar";
import { filterOrders } from "@/components/admin/orderUtils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Orders = () => {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<RechargeOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<RechargeOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshingOrderId, setRefreshingOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch orders on initial load
  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recharge_orders' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchOrders();
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      
      // Apply current search filter
      if (searchTerm.trim() === "") {
        setFilteredOrders(fetchedOrders);
      } else {
        setFilteredOrders(filterOrders(fetchedOrders, searchTerm));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "获取订单失败",
        description: "加载订单时发生错误",
        variant: "destructive",
      });
    }
  };
  
  // Update filtered orders whenever search term changes
  useEffect(() => {
    setFilteredOrders(filterOrders(orders, searchTerm));
  }, [searchTerm, orders]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleRowClick = (order: RechargeOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };
  
  const handleStatusUpdate = async (status: "pending" | "completed" | "failed") => {
    if (!selectedOrder) return;
    
    setIsUpdating(true);
    try {
      await updateOrderStatus(selectedOrder.order_id, status);
      
      toast({
        title: "订单已更新",
        description: `订单 ${selectedOrder.order_id} 状态已更改为 ${
          status === "pending" ? "待处理" : status === "completed" ? "已完成" : "失败"
        }`,
      });
      
      setIsDialogOpen(false);
      
      // Refresh orders after update
      fetchOrders();
    } catch (error) {
      toast({
        title: "更新订单失败",
        description: error instanceof Error ? error.message : "发生错误",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshPhoneInfo = async (orderId: string) => {
    setRefreshingOrderId(orderId);
    try {
      const updatedOrder = await refreshOrderPhoneInfo(orderId);
      if (updatedOrder) {
        toast({
          title: "刷新成功",
          description: `手机号 ${updatedOrder.phone_number} 的余额已更新`,
        });
        
        // 如果当前选中的订单是被刷新的，更新弹窗数据
        if (selectedOrder && selectedOrder.order_id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        
        // 刷新订单列表
        fetchOrders();
      } else {
        toast({
          title: "刷新失败",
          description: "无法获取最新信息",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("刷新手机号信息失败:", error);
      toast({
        title: "刷新失败",
        description: "发生错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setRefreshingOrderId(null);
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">订单管理</h1>
        
        <SearchBar 
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="搜索订单号或手机号"
        />
        
        <OrdersTable 
          orders={filteredOrders}
          onRowClick={handleRowClick}
          onRefreshPhoneInfo={handleRefreshPhoneInfo}
          refreshingOrderId={refreshingOrderId}
        />
        
        <OrderDetailDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
          onRefreshPhoneInfo={handleRefreshPhoneInfo}
          refreshingOrderId={refreshingOrderId}
          isUpdating={isUpdating}
        />
      </div>
    </AdminLayout>
  );
};

export default Orders;
