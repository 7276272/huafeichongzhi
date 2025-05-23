import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getPaymentAddresses } from "@/services/paymentService";
import { 
  getUserWalletByUserId,
  getWalletTransactionsByUserId,
  getWalletRechargeRequestsByUserId,
  ensureUserWallet
} from "@/services/walletService";
import { PaymentAddress, WalletTransaction, WalletRechargeRequest } from "@/types";
import { PlusCircle, ArrowDown, ArrowUp, ShoppingBag, User, Wallet, Home, RefreshCw } from "lucide-react";
import "@/styles/neumorphism.css";
import "@/styles/profile-update.css";
import "@/styles/neumorphic-cards.css";

// Import the components we created
import { CombinedTransactionItem } from "@/components/wallet/TransactionList";
import RechargeDialog from "@/components/wallet/RechargeDialog";

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [paymentAddresses, setPaymentAddresses] = useState<PaymentAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<WalletRechargeRequest[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  // 定义fetchUserData在前面，解决依赖问题
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingBalance(true);
    setIsLoadingTransactions(true);
    try {
      console.log("Fetching wallet data for user:", user.id);
      
      // Ensure user has a wallet
      await ensureUserWallet(user.id);
      
      // Fetch wallet balance
      const wallet = await getUserWalletByUserId(user.id);
      console.log("User wallet data:", wallet);
      if (wallet) {
        setUserBalance(wallet.balance);
      } else {
        console.log("No wallet found for user, setting balance to 0");
        setUserBalance(0);
      }
      
      // Fetch wallet transactions
      const transactions = await getWalletTransactionsByUserId(user.id);
      console.log("User transactions:", transactions);
      setTransactions(transactions);
      
      // Fetch recharge requests
      const requests = await getWalletRechargeRequestsByUserId(user.id);
      console.log("User recharge requests:", requests);
      setRechargeRequests(requests);
    } catch (error) {
      console.error("Error fetching user wallet data:", error);
      toast({
        title: "获取钱包数据失败",
        description: "请稍后再试或联系客服",
        variant: "destructive",
      });
      setUserBalance(0);
    } finally {
      setIsLoadingBalance(false);
      setIsLoadingTransactions(false);
    }
  }, [user, toast]);
  
  // Fetch payment addresses
  useEffect(() => {
    const fetchPaymentAddresses = async () => {
      setIsLoadingAddresses(true);
      try {
        const addresses = await getPaymentAddresses();
        setPaymentAddresses(addresses.filter(addr => addr.active));
      } catch (error) {
        console.error("Error fetching payment addresses:", error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    
    fetchPaymentAddresses();
  }, []);
  
  // Fetch user wallet balance and transactions
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  // Add a polling interval to refresh wallet data periodically (every 30 seconds)
  useEffect(() => {
    if (!user) return;
    
    const intervalId = setInterval(() => {
      console.log("Auto-refreshing wallet data...");
      fetchUserData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchUserData, user]);

  if (!user) {
    return (
      <Layout>
        <div className="neumorphic-container">
          <div className="top-auth-container">
            <div className="top-auth-title">达人任务</div>
            <div className="top-auth-buttons">
              <Link to="/auth" className="top-login-btn">登录</Link>
              <Link to="/auth/register" className="top-register-btn">注册</Link>
            </div>
          </div>
          
          <div className="neumorphic-card p-8">
            <h2 className="neumorphic-title text-center text-xl mb-6">请登录后查看您的钱包信息</h2>
            <div className="flex justify-center">
              <button className="neumorphic-button" onClick={() => navigate("/auth")}>前往登录</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Combine transactions and recharge requests for display with proper typing
  const allTransactions: CombinedTransactionItem[] = [
    ...transactions.map(tx => ({
      id: tx.id,
      date: tx.created_at,
      type: tx.type,
      amount: tx.amount,
      status: tx.status
    })),
    ...rechargeRequests.map(req => ({
      id: req.id,
      date: req.created_at,
      type: 'recharge',
      amount: req.amount,
      status: req.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 获取交易图标
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge':
        return <PlusCircle className="text-green-500" size={18} />;
      case 'withdraw':
        return <ArrowUp className="text-red-500" size={18} />;
      default:
        return <ArrowDown className="text-blue-500" size={18} />;
    }
  };

  return (
    <Layout>
      <div className="bg-[#5ee7dd] min-h-screen pb-20">
        
        {/* 余额和快捷功能合并卡片 */}
        <div className="mx-4 my-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">账户余额</span>
            </h3>
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600 text-base font-medium">可用余额 (USDT)</div>
              <div className="flex items-center">
                <button 
                  className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg p-1.5 transition-colors"
                  onClick={fetchUserData}
                  disabled={isLoadingBalance}
                >
                  <RefreshCw size={14} className={isLoadingBalance ? 'animate-spin' : ''} />
                  <span className="ml-1 text-sm">刷新</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 shadow-sm mb-6">
              {isLoadingBalance ? (
                <div className="h-10 w-32 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 mr-2 shadow-sm">
                      <img 
                        src="/usdt.jpg" 
                        alt="USDT Logo" 
                        className="w-10 h-10 object-cover rounded-full" 
                      />
                    </div>
                    <div className="text-4xl font-bold text-red-500">
                      {userBalance?.toFixed(2) || '0.00'}U
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">快捷功能</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div 
                className="group transform transition-transform hover:scale-105 cursor-pointer"
                onClick={() => setShowRechargeDialog(true)}
              >
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <ArrowDown className="w-7 h-7 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">充值</span>
                </div>
              </div>
              <div className="group transform transition-transform hover:scale-105 cursor-pointer">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <ArrowUp className="w-7 h-7 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">提现</span>
                </div>
              </div>
              <div 
                className="group transform transition-transform hover:scale-105 cursor-pointer"
                onClick={() => navigate('/transactions')}
              >
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <RefreshCw className="w-7 h-7 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">交易纪录</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 交易历史区域 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">交易历史</span>
            </h3>
            <div className="p-3">
              {isLoadingTransactions ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center p-3 bg-gray-50 rounded-lg shadow-sm">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="w-16">
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 ml-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : allTransactions.length === 0 ? (
                <div className="text-center py-8 my-2 bg-gray-50 rounded-lg shadow-inner">
                  <p className="text-gray-500 font-medium">暂无交易记录</p>
                  <p className="text-xs mt-2 text-gray-400">完成充值后，交易记录将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allTransactions.slice(0, 10).map((transaction, index) => (
                    <div key={index} className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100 mb-3 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shadow bg-gray-50">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {transaction.type === 'recharge' ? '充值' : 
                               transaction.type === 'withdraw' ? '提现' : '交易'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(transaction.date).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${transaction.type === 'withdraw' ? 'text-red-500' : 'text-green-500'}`}>
                            {transaction.type === 'withdraw' ? '-' : '+'}{transaction.amount.toFixed(2)} USDT
                          </p>
                          <p className="text-xs mt-1">
                            {transaction.status === 'completed' ? (
                              <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">已完成</span>
                            ) : transaction.status === 'pending' ? (
                              <span className="text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full text-xs font-medium">处理中</span>
                            ) : (
                              <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">失败</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {allTransactions.length > 10 && (
                    <button 
                      className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors font-medium text-sm flex items-center justify-center" 
                      onClick={() => navigate('/transactions')}
                    >
                      <RefreshCw size={14} className="mr-2" />
                      查看全部交易记录
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部导航 */}
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
        <Link to="/wallet" className="neumorphic-nav-item active">
          <div className="neumorphic-nav-icon active">
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
      
      {/* USDT充值对话框 */}
      <RechargeDialog 
        open={showRechargeDialog} 
        onOpenChange={setShowRechargeDialog}
        paymentAddresses={paymentAddresses}
        userId={user?.id || ''}
        isLoadingAddresses={isLoadingAddresses}
        onRechargeComplete={fetchUserData}
      />
    </Layout>
  );
};

export default WalletPage;
