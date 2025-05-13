
import React from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const RechargeSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 如果没有传递状态，重定向到首页
  if (!location.state || !location.state.order) {
    return <Navigate to="/" replace />;
  }
  
  const { 
    order, 
    phoneNumber, 
    amount, 
    carrier, 
    name, 
    isBatch, 
    batchCount,
    phoneInfo
  } = location.state;
  
  // Get phone info from whatever source is available
  const displayPhoneInfo = {
    balance: phoneInfo?.balance || null,
    province: phoneInfo?.province || null,
    city: phoneInfo?.city || null
  };
  
  // Calculate total amount for batch orders
  const totalAmount = isBatch ? amount * batchCount : amount;
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">充值成功！</h1>
          <p className="text-gray-600 mb-6">
            {isBatch 
              ? `您的${batchCount}个手机号码批量充值订单已成功处理。`
              : "您的手机充值订单已成功处理。"}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-y-4 text-left">
              {name && (
                <>
                  <p className="text-gray-500">姓名:</p>
                  <p className="font-medium">{name}</p>
                </>
              )}
              
              {isBatch ? (
                <>
                  <p className="text-gray-500">批量充值:</p>
                  <p className="font-medium">{batchCount}个号码</p>
                  <p className="text-gray-500">单价:</p>
                  <p className="font-medium">¥{amount}</p>
                  <p className="text-gray-500">总金额:</p>
                  <p className="font-medium">¥{totalAmount}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-500">手机号码:</p>
                  <p className="font-medium">{phoneNumber}</p>
                  <p className="text-gray-500">金额:</p>
                  <p className="font-medium">¥{amount}</p>
                </>
              )}
              
              {!isBatch && displayPhoneInfo.balance !== null && (
                <>
                  <p className="text-gray-500">话费余额:</p>
                  <p className="font-medium">¥{displayPhoneInfo.balance}</p>
                </>
              )}
              
              {!isBatch && carrier && (
                <>
                  <p className="text-gray-500">运营商:</p>
                  <p className="font-medium">{carrier}</p>
                </>
              )}
              
              {!isBatch && displayPhoneInfo.province && (
                <>
                  <p className="text-gray-500">归属地:</p>
                  <p className="font-medium">{displayPhoneInfo.province} {displayPhoneInfo.city}</p>
                </>
              )}
              
              <p className="text-gray-500">订单编号:</p>
              <p className="font-medium">{order.order_id}</p>
              
              <p className="text-gray-500">状态:</p>
              <p className="text-green-600 font-medium">已提交</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate("/recharge")} 
              variant="default" 
              className="w-full"
            >
              {isBatch ? "再次批量充值" : "充值另一个号码"}
            </Button>
            
            <Button 
              onClick={() => navigate("/orders")} 
              variant="outline" 
              className="w-full"
            >
              查看我的订单
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RechargeSuccess;
