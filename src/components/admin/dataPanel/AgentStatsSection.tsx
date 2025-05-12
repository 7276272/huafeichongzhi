import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Users, DollarSign } from "lucide-react";

interface AgentStatsSectionProps {
  totalAgents: number;
  activeAgents: number;
  agentRevenue: number;
  agentCommission: number;
}

const AgentStatsSection = ({
  totalAgents,
  activeAgents,
  agentRevenue,
  agentCommission
}: AgentStatsSectionProps) => {
  // 计算活跃率
  const activeRate = totalAgents > 0 ? Math.round((activeAgents / totalAgents) * 100) : 0;
  // 计算佣金率
  const commissionRate = agentRevenue > 0 ? Math.round((agentCommission / agentRevenue) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">代理商统计</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">总代理数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{totalAgents.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                累计
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">活跃代理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">{activeAgents.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {activeRate}%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">代理销售额</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">¥{agentRevenue.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                15%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">代理佣金</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold">¥{agentCommission.toLocaleString()}</span>
              <span className="text-green-600 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {commissionRate}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">代理商活跃度</h3>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 p-4">
            <div className="bg-gray-50 rounded-lg p-6 h-full flex flex-col justify-center items-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{activeRate}%</div>
              <div className="text-gray-500 text-sm">代理商活跃率</div>
              <div className="w-full max-w-md mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>活跃代理</span>
                  <span>{activeAgents} / {totalAgents}</span>
                </div>
                <div className="progress-bar">
                  <div className={`chart-bar-blue chart-bar-w-${Math.round(activeRate)}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">佣金分析</h3>
            <DollarSign className="h-5 w-5 text-gray-500" />
          </div>
          
          <div className="h-64 p-4">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold text-green-600 mb-2">¥{agentCommission.toLocaleString()}</div>
                <div className="text-gray-500 text-sm">总佣金支出</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-center items-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{commissionRate}%</div>
                <div className="text-gray-500 text-sm">平均佣金率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border shadow">
        <h3 className="text-lg font-medium mb-4">代理商业绩排名</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left">排名</th>
                <th className="py-3 px-4 text-left">代理ID</th>
                <th className="py-3 px-4 text-left">代理名称</th>
                <th className="py-3 px-4 text-right">订单数量</th>
                <th className="py-3 px-4 text-right">销售额</th>
                <th className="py-3 px-4 text-right">佣金</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{i}</td>
                  <td className="py-3 px-4">AG{String(i).padStart(3, '0')}</td>
                  <td className="py-3 px-4">代理商 {i}</td>
                  <td className="py-3 px-4 text-right">{Math.floor(Math.random() * 100) + 50}</td>
                  <td className="py-3 px-4 text-right">¥{(Math.random() * 10000 + 5000).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">¥{(Math.random() * 500 + 250).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-gray-500 mt-4 text-center">
          注：此表格显示销售业绩排名前5的代理商数据
        </div>
      </div>
    </div>
  );
};

export default AgentStatsSection;
