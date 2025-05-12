import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

interface UserStatsSectionProps {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
}

const UserStatsSection = ({ totalUsers, newUsers, activeUsers }: UserStatsSectionProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">用户统计</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{totalUsers.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                累计
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">新增用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{newUsers.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                8%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">活跃用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{activeUsers.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                10%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">用户增长趋势</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          图表加载中...
        </div>
        <div className="text-sm text-gray-500 mt-4">
          注：此图表展示近期用户增长情况，包括新增用户和活跃用户的对比。
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">用户地区分布</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            图表加载中...
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">用户活跃度分析</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            图表加载中...
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsSection;
