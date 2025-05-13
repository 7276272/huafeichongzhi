import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import SignupForm from "@/components/auth/SignupForm";
import { Home, ShoppingBag, Wallet, User } from "lucide-react";
import "@/styles/neumorphism.css";
import "@/styles/neumorphic-cards.css";
import { recordReferralRegistration } from "@/services/agentReferralService";

const Register = () => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  // 获取URL中的推广码参数
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      console.log("检测到推广码:", ref);
    }
  }, [searchParams]);

  // 处理注册成功后的引荐记录
  const handleRegistrationSuccess = async (userId: string) => {
    if (referralCode) {
      try {
        // 记录推广注册
        await recordReferralRegistration(referralCode, userId);
        console.log("成功记录推广注册:", { referralCode, userId });
      } catch (error) {
        console.error("记录推广注册失败:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="bg-[#5ee7dd] min-h-screen pb-20 pt-6">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-md mb-4">
              <div className="w-12 h-12 flex flex-col items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-[#5ee7dd] mb-1"></div>
                <div className="w-8 h-4 rounded-t-full bg-[#5ee7dd]"></div>
              </div>
            </div>
            <div className="w-32 h-6 rounded-md bg-gray-200 bg-opacity-30"></div>
          </div>

          <div className="neumorphic-card-new p-4 mb-4">
            <div className="mb-4">
              <div className="flex bg-gray-100 rounded-lg overflow-hidden mb-6">
                <button
                  className="flex-1 py-3 text-center font-medium text-gray-600"
                  onClick={() => navigate("/auth")}
                >
                  登录
                </button>
                <button
                  className="flex-1 py-3 text-center font-medium bg-[#5ee7dd] text-white shadow-md"
                >
                  注册
                </button>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                注册账户
                {referralCode && <span className="block text-sm text-gray-600 mt-1">推广码: {referralCode}</span>}
              </h2>

              <SignupForm 
                email={email}
                setEmail={setEmail}
                onSwitchToLogin={() => navigate("/auth")}
                returnTo="/"
                referralCode={referralCode}
                onRegistrationSuccess={handleRegistrationSuccess}
              />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mt-4 space-x-6">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#5ee7dd" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#5ee7dd" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#5ee7dd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 底部导航栏 - 与其他页面保持一致 */}
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

export default Register;
