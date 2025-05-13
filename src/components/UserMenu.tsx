
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <User className="mr-2 h-4 w-4" />
          登录 / 注册
        </Button>
      </Link>
    );
  }

  // Get user initials or first letter of email for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.user_metadata?.avatar_url || "/touxiang.png"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="max-w-[100px] truncate">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-gray-500">账户 ID: {user.id.substring(0, 8)}...</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="w-full">个人中心</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/orders" className="w-full">我的订单</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={async () => {
            try {
              await signOut();
              console.log("用户已退出，重定向到首页");
              navigate("/", { replace: true });
              // 强制刷新页面以确保状态完全清除
              window.location.reload();
            } catch (error) {
              console.error("退出登录失败:", error);
            }
          }} 
          className="text-red-500"
        >
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
