
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from 'react-router-dom';
import Layout from "@/components/Layout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
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
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg mb-4">
              <img 
                src="/icon.png" 
                alt="畅充宝图标" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800">畅充宝</h1>
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
            <p className="text-gray-600 text-sm">其他登录方式</p>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/weixin.png" alt="微信" className="w-6 h-6" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/qq.png" alt="QQ" className="w-6 h-6" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/weibo.png" alt="微博" className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
