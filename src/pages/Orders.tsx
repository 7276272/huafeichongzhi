import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { getAllOrders } from "@/services/orderManagement";
import { RechargeOrder } from "@/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import OrderDetailDialog from "@/components/OrderDetailDialog";
import { ShoppingBag, Home, Wallet, User } from "lucide-react";
import "@/styles/neumorphism.css";
import "@/styles/profile-update.css";
import "@/styles/neumorphic-cards.css";

const Orders = () => {
  const [orders, setOrders] = useState<RechargeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<RechargeOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const getOrders = async () => {
      try {
        if (!user) {
          toast({
            title: "错误",
            description: "请先登录",
            variant: "destructive",
          });
          return;
        }
        
        // 获取所有订单
        const allOrders = await getAllOrders();
        
        // 按照用户ID和用户手机号过滤当前用户订单
        if (user.phone) {
          // 如果用户有手机号码，则通过用户ID或手机号过滤
          const userOrders = allOrders.filter(order => 
            order.phone_number === user.phone || 
            order.user_id === user.id
          );
          setOrders(userOrders);
        } else {
          // 如果用户没有手机号码，只通过用户ID过滤
          const userOrders = allOrders.filter(order => order.user_id === user.id);
          setOrders(userOrders);
        }
      } catch (error) {
        console.error("获取订单失败", error);
        toast({
          title: "获取订单失败",
          description: "无法获取您的充值订单，请稍后再试",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    getOrders();
  }, [user, toast]);



  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      console.error("日期格式化错误", error);
      return dateString;
    }
  };

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "处理中";
      case "COMPLETED":
        return "已完成";
      case "FAILED":
        return "失败";
      default:
        return "未知";
    }
  };

  return (
    <Layout>
      {/* 主要内容区域 */}
      <div className="bg-[#5ee7dd] min-h-screen pb-20">
        {/* 我的订单标题卡片 */}
        <div className="mx-4 my-4">
          <div className="neumorphic-title-card">
            <div className="text-gray-700 font-bold text-xl text-center">
              我的订单
            </div>
          </div>
        </div>
        
        {/* 订单列表区域 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new">
            <div className="neumorphic-card-icon">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">充值记录</h3>

            <div>
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <div className="loading-spinner"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div 
                      key={order.id}
                      className="neumorphic-card-content cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDialogOpen(true);
                      }}
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm font-medium">{order.phone_number}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            订单时间: {formatDate(order.created_at).split(' ')[0]}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            订单编号: ord-{order.order_id.substring(0, 3)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-red-500">¥{order.amount.toFixed(2)}</div>
                          <div className="text-xs mt-auto text-gray-500 pt-6">
                            {getStatusText(order.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 my-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">您还没有充值记录</p>
                  <p className="text-xs mt-1 text-gray-400">完成充值后，订单将显示在这里</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 订单详情对话框组件 */}
      <OrderDetailDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        order={selectedOrder}
      />
      
      {/* 底部导航 */}
      <div className="neumorphic-bottom-nav">
        <Link to="/" className="neumorphic-nav-item">
          <div className="neumorphic-nav-icon">
            <Home size={22} />
          </div>
          <span>首页</span>
        </Link>
        <Link to="/orders" className="neumorphic-nav-item active">
          <div className="neumorphic-nav-icon active">
            <ShoppingBag size={22} />
          </div>
          <span>订单</span>
        </Link>
        <Link to="/wallet" className="neumorphic-nav-item">
          <div className="neumorphic-nav-icon">
            <Wallet size={22} />
          </div>
          <span>钱包</span>
        </Link>
        <Link to="/profile" className="neumorphic-nav-item">
          <div className="neumorphic-nav-icon">
            <User size={22} />
          </div>
          <span>我的</span>
        </Link>
      </div>
    </Layout>
  );
};

export default Orders;
