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

  // 合并交易记录和充值请求
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
      <div className="neumorphic-container pb-20">
        <div className="user-profile-card">
          <h2 className="text-xl font-bold text-center py-4">
            我的钱包
          </h2>
        </div>
        
        {/* 余额卡片区域 */}
        <div className="neumorphic-card" style={{height: 'auto'}}>
          <h3 className="feature-title mt-4">账户余额</h3>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600 text-base">可用余额</div>
              <div className="flex items-center">
                <button 
                  className="neumorphic-button-small flex items-center mr-2"
                  onClick={fetchUserData}
                  disabled={isLoadingBalance}
                >
                  <RefreshCw size={14} className={isLoadingBalance ? 'animate-spin' : ''} />
                  <span className="ml-1">刷新</span>
                </button>
                <button 
                  className="neumorphic-button-small neumorphic-button-primary"
                  onClick={() => setShowRechargeDialog(true)}
                >
                  <PlusCircle size={14} className="mr-1" />
                  充值
                </button>
              </div>
            </div>
            
            <div className="flex items-end">
              {isLoadingBalance ? (
                <div className="h-10 w-32 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <div className="text-3xl font-bold text-red-500">¥ {userBalance?.toFixed(2) || '0.00'}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* 功能按钮区域 */}
        <div className="neumorphic-card mt-4" style={{height: 'auto'}}>
          <h3 className="feature-title mt-4">快捷功能</h3>
          <div className="p-4">
            <div className="features-grid grid-cols-3">
              <div 
                className="grid-item" 
                onClick={() => setShowRechargeDialog(true)}
              >
                <div className="grid-icon">
                  <PlusCircle size={24} className="text-blue-500" />
                </div>
                <div className="grid-label">充值</div>
              </div>
              
              <div 
                className="grid-item" 
                onClick={() => navigate('/withdraw')}
              >
                <div className="grid-icon">
                  <ArrowUp size={24} className="text-green-500" />
                </div>
                <div className="grid-label">提现</div>
              </div>
              
              <div 
                className="grid-item" 
                onClick={() => navigate('/transactions')}
              >
                <div className="grid-icon">
                  <ArrowDown size={24} className="text-purple-500" />
                </div>
                <div className="grid-label">交易记录</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 交易记录区域 */}
        <div className="neumorphic-card mt-4" style={{height: 'auto'}}>
          <h3 className="feature-title mt-4">近期交易</h3>
          <div className="p-4">
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <RefreshCw className="animate-spin h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-500">加载交易记录中...</p>
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="text-center py-6 my-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">暂无交易记录</p>
                <p className="text-xs mt-1 text-gray-400">完成充值后，交易记录将显示在这里</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTransactions.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm mb-3 cursor-pointer transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-gray-50">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-semibold">
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
                          {transaction.type === 'withdraw' ? '-' : '+'}¥{transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs mt-1">
                          {transaction.status === 'completed' ? (
                            <span className="text-green-500">已完成</span>
                          ) : transaction.status === 'pending' ? (
                            <span className="text-yellow-500">处理中</span>
                          ) : (
                            <span className="text-red-500">失败</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {allTransactions.length > 10 && (
                  <button className="neumorphic-button w-full mt-3" onClick={() => navigate('/transactions')}>
                    查看全部交易记录
                  </button>
                )}
              </div>
            )}
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
