import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Phone, ShieldCheck, Zap, ShoppingBag, User, CreditCard, Star, Home, Wallet } from "lucide-react";
import { rechargeOptions } from "@/services/orderService";
import "@/styles/neumorphism.css";
import "@/styles/profile-update.css";
import "@/styles/neumorphic-cards.css";

const Index = () => {
  const navigate = useNavigate();

  const goToRecharge = () => {
    navigate("/recharge");
  };

  return (
    <Layout>
      <div className="bg-[#5ee7dd] min-h-screen pb-20">
        {/* 轮播图区域 */}
        <div className="mx-4 my-4">
          <div className="neumorphic-card-new overflow-hidden p-0 rounded-xl shadow-md">
            <img 
              src="https://placekitten.com/600/300" 
              alt="广告图片"
              className="w-full h-48 object-cover"
            />
          </div>
        </div>
        
        {/* 功能网格 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">快捷功能</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="group transform transition-transform hover:scale-105 cursor-pointer"
                onClick={goToRecharge}
              >
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <Phone className="w-7 h-7 text-red-500 group-hover:text-red-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">话费充值</span>
                </div>
              </div>
              <Link to="/wallet" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <CreditCard className="w-7 h-7 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">我的钱包</span>
                </div>
              </Link>
              <Link to="/orders" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <ShoppingBag className="w-7 h-7 text-green-500 group-hover:text-green-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">我的订单</span>
                </div>
              </Link>
              <Link to="/profile" className="group transform transition-transform hover:scale-105">
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center mb-2 shadow group-hover:shadow-md transition-shadow">
                    <User className="w-7 h-7 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">个人中心</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
        
        {/* 热门充值卡片 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">热门充值选项</span>
            </h3>
            <div className="px-4 py-2 flex justify-between items-center mb-2 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-700">快速充值指南</h3>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">新手必看</span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-2">
              {rechargeOptions.slice(0, 6).map((option) => (
                <div 
                  key={option.value} 
                  className="bg-gradient-to-b from-white to-gray-50 rounded-xl p-3 text-center shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  onClick={goToRecharge}
                >
                  <p className="text-xl font-bold text-red-500">{option.label}</p>
                  {option.discount && (
                    <span className="bg-red-50 text-red-500 text-xs px-2 py-1 rounded-full mt-1 inline-block border border-red-100">
                      省 {option.discount}元
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button 
              className="w-full py-2.5 mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors font-medium text-sm flex items-center justify-center" 
              onClick={goToRecharge}
            >
              <ShoppingBag size={14} className="mr-2" />
              查看全部充值选项
            </button>
          </div>
        </div>
        
        {/* 三大特点 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">为什么选择我们</span>
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow border border-red-100">
                  <Zap className="h-8 w-8 text-red-500 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-base text-gray-800 group-hover:text-gray-900">即时充值</h3>
                <p className="text-xs text-gray-600 mt-1 text-center">秒充秒到账</p>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow border border-blue-100">
                  <ShieldCheck className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-base text-gray-800 group-hover:text-gray-900">100% 安全</h3>
                <p className="text-xs text-gray-600 mt-1 text-center">银行级安全</p>
              </div>
              
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow border border-green-100">
                  <Phone className="h-8 w-8 text-green-500 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-base text-gray-800 group-hover:text-gray-900">全部运营商</h3>
                <p className="text-xs text-gray-600 mt-1 text-center">支持三大运营商</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 用户评价 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">用户评价</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 shadow">
                    <span className="text-red-500 font-bold text-base">Z</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">张伟</p>
                    <div className="flex mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                  "畅充宝在我急需给手机充值时帮了我大忙。服务快速可靠！"
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow">
                    <span className="text-blue-500 font-bold text-base">L</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">李梅</p>
                    <div className="flex mt-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                  "我喜欢大额充值时的折扣。我已经使用这项服务几个月了。"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部导航 */}
      <div className="neumorphic-bottom-nav">
        <Link to="/" className="neumorphic-nav-item active">
          <div className="neumorphic-nav-icon active">
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

export default Index;
