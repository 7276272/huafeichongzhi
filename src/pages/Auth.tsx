import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'react-router-dom';
import Layout from "@/components/Layout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Home, ShoppingBag, Wallet, User } from "lucide-react";
import "@/styles/neumorphism.css";
import "@/styles/neumorphic-cards.css";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get the return path from URL param or default to "/"
  const returnTo = searchParams.get('returnTo') || "/";

  const renderAuthForm = () => {
    if (showForgotPassword) {
      return (
        <ForgotPasswordForm 
          email={email} 
          setEmail={setEmail} 
          onBackToLogin={() => setShowForgotPassword(false)}
        />
      );
    }

    if (isLogin) {
      return (
        <LoginForm 
          email={email}
          setEmail={setEmail}
          onForgotPassword={() => setShowForgotPassword(true)}
          onSwitchToSignup={() => setIsLogin(false)}
          returnTo={returnTo}
        />
      );
    }

    return (
      <SignupForm 
        email={email}
        setEmail={setEmail}
        onSwitchToLogin={() => setIsLogin(true)}
        returnTo={returnTo}
      />
    );
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
                  className={`flex-1 py-3 text-center font-medium ${isLogin && !showForgotPassword ? 'bg-[#5ee7dd] text-white shadow-md' : 'text-gray-600'}`}
                  onClick={() => { setIsLogin(true); setShowForgotPassword(false); }}
                >
                  登录
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium ${!isLogin && !showForgotPassword ? 'bg-[#5ee7dd] text-white shadow-md' : 'text-gray-600'}`}
                  onClick={() => { setIsLogin(false); setShowForgotPassword(false); }}
                >
                  注册
                </button>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                {showForgotPassword ? "重置密码" : isLogin ? "登录账户" : "注册账户"}
              </h2>

              {renderAuthForm()}
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

export default Auth;
