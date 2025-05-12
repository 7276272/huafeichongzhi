
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 错误: 用户尝试访问不存在的路由:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-6xl md:text-7xl font-bold mb-4 text-blue-600">404</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-6">哎呀！页面未找到</p>
        <p className="text-gray-500 mb-8">您尝试访问的页面不存在或已被移动</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full">返回首页</Button>
          </Link>
          <Link to="/recharge">
            <Button variant="outline" className="w-full">去充值</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
