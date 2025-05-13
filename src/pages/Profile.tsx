import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { CreditCard, LogOut, Wallet, User, ShoppingBag, Star, Home } from "lucide-react";
import "@/styles/neumorphism.css";
import { getUserWalletByUserId } from "@/services/userWalletService";
import { getAllOrders } from "@/services/orderManagement";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [userStats, setUserStats] = useState({
    name: "",
    level: "金牌代理",
    followers: 0,
    availableBalance: "0.00", // 可用余额(USDT)
    frozenBalance: "0.00",     // 冻结余额(USDT)
    inTransitAmount: "0",      // 在途金额(RMB)
    today: "¥0.00",
    yesterday: "¥0.00",
    points: 0,
    waitingCount: 0,
    processingCount: 0,
    completedCount: 0
  });

  // 获取用户统计数据
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;
      
      try {
        // 获取用户钱包数据
        const wallet = await getUserWalletByUserId(user.id);
        
        // 获取用户订单数据
        const allOrders = await getAllOrders();
        
        // 过滤出当前用户的订单
        const userOrders = allOrders.filter(order => order.user_id === user.id);
        
        // 计算订单统计数据 - 使用正确的状态分类
        const completedOrders = userOrders.filter(order => order.status === "completed");
        const processingOrders = userOrders.filter(order => order.status === "processing");
        const pendingOrders = userOrders.filter(order => order.status === "pending" || order.status === "failed");
        
        // 计算冻结余额（处理中订单的USDT金额）
        const frozenAmount = processingOrders.reduce((total, order) => {
          // 使用实际的USDT金额，这里假设每元人民币等于0.14 USDT
          const usdtRate = 0.14;
          return total + (order.amount * usdtRate);
        }, 0);
        
        // 计算在途金额（处理中订单的人民币金额）
        const inTransitAmount = processingOrders.reduce((total, order) => {
          return total + order.amount;
        }, 0);
        
        setUserStats({
          name: user.email?.split("@")[0] || "User",
          level: "金牌代理",
          followers: 0,
          availableBalance: wallet ? wallet.balance.toFixed(2) : "0.00",  // 可用余额(USDT)
          frozenBalance: frozenAmount.toFixed(2),                         // 冻结余额(USDT)
          inTransitAmount: inTransitAmount.toFixed(2),                   // 在途金额(RMB)
          today: "¥0.00",
          yesterday: "¥0.00",
          points: 0,
          waitingCount: pendingOrders.length,                            // 已取消订单数
          processingCount: processingOrders.length,                       // 处理中订单数
          completedCount: completedOrders.length                          // 已完成订单数
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserStats();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="bg-[#5ee7dd] min-h-screen pb-20 flex items-center justify-center">
          <div className="mx-4 w-full max-w-md">
            <div className="neumorphic-card-new p-8">
              <h2 className="text-center text-xl font-medium text-gray-700 mb-6">请登录后查看您的个人信息</h2>
              <div className="flex justify-center">
                <Link to="/auth">
                  <button className="neumorphic-button bg-gradient-to-r from-blue-400 to-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300">前往登录</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="neumorphic-bottom-nav">
          <Link to="/" className="neumorphic-nav-item">
            <div className="neumorphic-nav-icon">
              <Home size={22} />
            </div>
            <span>首页</span>
          </Link>
          <Link to="/orders" className="neumorphic-nav-item">
            <div className="neumorphic-nav-icon">
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
          <Link to="/profile" className="neumorphic-nav-item active">
            <div className="neumorphic-nav-icon active">
              <User size={22} />
            </div>
            <span>我的</span>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#5ee7dd] min-h-screen pb-20">
        {/* 主要内容区域 */}
        
        {/* 用户信息卡片 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                <img 
                  src="/touxiang.png" 
                  alt="用户头像" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="text-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">{userStats.name}</h2>
              <div className="flex flex-col items-center mt-2 mb-3 border border-gray-200 rounded-lg p-2 mx-2 bg-gray-50">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-sm text-gray-600 font-medium">账号：</span>
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm text-gray-600 font-medium">级别：</span>
                  <span className="text-sm text-blue-600 font-medium">{userStats.level}</span>
                </div>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-5 py-1.5 text-sm font-medium transition-colors shadow-sm">编辑资料</button>
            </div>
          </div>
        </div>

        {/* 我的订单 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">我的订单</span>
            </h3>
            <div className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden">
              <div className="grid grid-cols-3 gap-0 border-b border-blue-100">
                <div className="text-center p-3">
                  <p className="text-gray-700 font-medium text-2xl">{userStats.completedCount}</p>
                  <p className="text-xs text-gray-600">已完成</p>
                </div>
                <div className="text-center p-3 border-l border-r border-blue-100">
                  <p className="text-gray-700 font-medium text-2xl">{userStats.processingCount}</p>
                  <p className="text-xs text-gray-600">处理中</p>
                </div>
                <div className="text-center p-3">
                  <p className="text-gray-700 font-medium text-2xl">{userStats.waitingCount}</p>
                  <p className="text-xs text-gray-600">已取消</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-0">
                <div className="text-center p-4 border-r border-blue-100">
                  <div className="inline-flex items-center mb-1 bg-blue-100 px-2 py-0.5 rounded-full">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-700 font-medium">冻结余额(USDT)</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{userStats.frozenBalance}</div>
                </div>
                <div className="text-center p-4">
                  <div className="inline-flex items-center mb-1 bg-green-100 px-2 py-0.5 rounded-full">
                    <CreditCard className="w-3.5 h-3.5 text-green-600 mr-1" />
                    <span className="text-xs text-green-700 font-medium">在途金额(RMB)</span>
                  </div>
                  <div className="text-xl font-bold text-green-600">¥{userStats.inTransitAmount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 功能网格 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">快捷功能</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/wallet" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <Wallet className="w-7 h-7 text-red-500 group-hover:text-red-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">我的钱包</span>
                </div>
              </Link>
              <Link to="/orders" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <ShoppingBag className="w-7 h-7 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">订单管理</span>
                </div>
              </Link>
              <Link to="/agents" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <User className="w-7 h-7 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">代理管理</span>
                </div>
              </Link>
              <div onClick={() => signOut()} className="group transform transition-transform hover:scale-105 cursor-pointer">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <LogOut className="w-7 h-7 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">退出登录</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要功能菜单 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">我的服务</span>
            </h3>
            
            <div className="space-y-3">
              <Link to="/wallet" className="block group">
                <div className="bg-gradient-to-r from-white to-gray-50 p-3 rounded-xl flex items-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-100">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-3 shadow transition-all duration-300 group-hover:shadow-md group-hover:bg-blue-100">
                    <Wallet className="w-6 h-6 text-blue-500 transition-colors group-hover:text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">我的钱包</div>
                    <div className="text-xs text-gray-500 group-hover:text-blue-500">余额: <span className="font-semibold text-red-500">{userStats.availableBalance} USDT</span></div>
                  </div>
                </div>
              </Link>

              <Link to="/orders" className="block group">
                <div className="bg-gradient-to-r from-white to-gray-50 p-3 rounded-xl flex items-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-green-100">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mr-3 shadow transition-all duration-300 group-hover:shadow-md group-hover:bg-green-100">
                    <CreditCard className="w-6 h-6 text-green-500 transition-colors group-hover:text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">我的订单</div>
                    <div className="text-xs text-gray-500 group-hover:text-green-500">查看所有订单记录</div>
                  </div>
                </div>
              </Link>

              <Link to="/points" className="block group">
                <div className="bg-gradient-to-r from-white to-gray-50 p-3 rounded-xl flex items-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-yellow-100">
                  <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mr-3 shadow transition-all duration-300 group-hover:shadow-md group-hover:bg-yellow-100">
                    <Star className="w-6 h-6 text-yellow-500 transition-colors group-hover:text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900">我的积分</div>
                    <div className="text-xs text-gray-500 group-hover:text-yellow-500">当前积分: <span className="font-semibold text-yellow-600">{userStats.points}</span></div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部导航 - 无论是否登录都显示 */}
      <div className="neumorphic-bottom-nav">
        <Link to="/" className="neumorphic-nav-item">
          <div className="neumorphic-nav-icon">
            <Home size={22} />
          </div>
          <span>首页</span>
        </Link>
        <Link to="/orders" className="neumorphic-nav-item">
          <div className="neumorphic-nav-icon">
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
        <Link to="/profile" className="neumorphic-nav-item active">
          <div className="neumorphic-nav-icon active">
            <User size={22} />
          </div>
          <span>我的</span>
        </Link>
      </div>
    </Layout>
  );
};

export default Profile;
