import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Phone, ShieldCheck, Zap, ShoppingBag, User, CreditCard, Star, Home, Wallet, ChevronLeft, ChevronRight, ArrowRight, Smartphone, Gift, Tag } from "lucide-react";
import { getRechargeOptions } from "@/services/rechargeOptions";
import { RechargeOption } from "@/types";
import "@/styles/neumorphism.css";
import "@/styles/profile-update.css";
import "@/styles/neumorphic-cards.css";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const bannerImages = ["/1.png", "/2.jpg", "/3.jpg"];
  const [rechargeProducts, setRechargeProducts] = useState<RechargeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // 获取充值产品
  useEffect(() => {
    const fetchRechargeProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getRechargeOptions();
        setRechargeProducts(products);
      } catch (error) {
        console.error("Error fetching recharge products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRechargeProducts();
  }, []);

  // 自动轮播效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const goToRecharge = (amount?: number) => {
    if (amount) {
      navigate(`/recharge?amount=${amount}`);
    } else {
      navigate("/recharge");
    }
  };
  
  // 处理点击事件的函数，接受MouseEvent和amount参数
  const handleProductClick = (e: React.MouseEvent, amount: number) => {
    e.preventDefault();
    goToRecharge(amount);
  };

  const goToPrevSlide = () => {
    setCurrentSlide(prevSlide => 
      prevSlide === 0 ? bannerImages.length - 1 : prevSlide - 1
    );
  };

  const goToNextSlide = () => {
    setCurrentSlide(prevSlide => 
      (prevSlide + 1) % bannerImages.length
    );
  };
  
  // 产品图标映射
  const getProductIcon = (value: number) => {
    // 根据金额大小返回不同的图标
    if (value <= 50) {
      return <Phone className="h-6 w-6 text-blue-500" />;
    } else if (value <= 100) {
      return <Smartphone className="h-6 w-6 text-green-500" />;
    } else if (value <= 300) {
      return <Gift className="h-6 w-6 text-purple-500" />;
    } else {
      return <Tag className="h-6 w-6 text-red-500" />;
    }
  };

  return (
    <Layout>
      <div className="bg-[#5ee7dd] min-h-screen pb-20">
        {/* 轮播图区域 */}
        <div className="mx-4 my-4">
          <div className="neumorphic-card-new overflow-hidden p-0 rounded-xl shadow-md relative">
            <div className="relative w-full h-48 overflow-hidden">
              {bannerImages.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`广告图片${index+1}`}
                  className={`absolute w-full h-48 object-cover transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
            </div>
            
            {/* 轮播控制按钮 */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button 
                onClick={goToPrevSlide} 
                aria-label="上一张图片"
                title="上一张图片"
                className="bg-white bg-opacity-50 rounded-full p-1 shadow hover:bg-opacity-70 transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button 
                onClick={goToNextSlide} 
                aria-label="下一张图片"
                title="下一张图片"
                className="bg-white bg-opacity-50 rounded-full p-1 shadow hover:bg-opacity-70 transition-all">
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </div>
            
            {/* 轮播指示器 */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              {bannerImages.map((_, index) => (
                <button 
                  key={index} 
                  aria-label={`切换到第${index + 1}张图片`}
                  title={`切换到第${index + 1}张图片`}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'}`}>
                </button>
              ))}
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
              <div 
                className="group transform transition-transform hover:scale-105 cursor-pointer"
                onClick={(e) => handleProductClick(e, 0)}
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
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">余额充值</span>
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
        
        {/* 充值产品卡片 */}
        <div className="mx-4 mb-4">
          <div className="neumorphic-card-new p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              <span className="inline-block border-b-2 border-blue-500 pb-1">充值产品</span>
            </h3>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {rechargeProducts
                    .slice(0, showAllProducts ? undefined : 3)
                    .map((product) => (
                      <div 
                        key={product.value} 
                        className="bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                              {getProductIcon(product.value)}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{product.name || product.businessType || '充值产品'}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{product.label}</span>
                                {product.discount && (
                                  <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-full inline-block border border-red-100">
                                    省 {product.discount}元
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => handleProductClick(e, product.value)}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium flex items-center"
                          >
                            前往 <ArrowRight size={14} className="ml-1" />
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
                
                <button 
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors font-medium text-sm flex items-center justify-center" 
                  onClick={() => setShowAllProducts(!showAllProducts)}
                >
                  {showAllProducts ? (
                    <>收起产品列表</>
                  ) : (
                    <>
                      <ShoppingBag size={14} className="mr-2" />
                      查看全部充值选项
                    </>
                  )}
                </button>
              </>
            )}
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
