
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { HomeIcon, OrdersIcon, ProfileIcon } from "./icons";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [clickedIcon, setClickedIcon] = useState<string | null>(null);
  
  const navItems = [
    {
      name: "首页",
      href: "/",
      icon: HomeIcon,
      requiresAuth: false,
    },
    {
      name: "订单",
      href: "/orders",
      icon: OrdersIcon,
      requiresAuth: true,
    },
    {
      name: "我的",
      href: user ? "/profile" : "/auth",
      icon: ProfileIcon,
      requiresAuth: false,
    },
  ];
  
  const handleIconClick = (itemName: string) => {
    setClickedIcon(itemName);
    setTimeout(() => setClickedIcon(null), 600);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-sm">
      <div className="bottom-nav">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const href = (item.requiresAuth && !user) ? "/auth" : item.href;
          const isClicked = clickedIcon === item.name;
          
          return (
            <Link
              to={href}
              key={index}
              className={cn(
                "nav-item",
                isActive && "active",
                isClicked && "icon-clicked"
              )}
              onClick={() => handleIconClick(item.name)}
            >
              <div className="icon-container">
                <div className="icon-background"></div>
                <div className="icon-glow"></div>
                <div className="icon">
                  <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "text-gray-500")} />
                </div>
              </div>
              <span className="label">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
