import React, { useState } from "react";
import { Agent } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, ExternalLink, DollarSign } from "lucide-react";
import EditAgentDialog from "./EditAgentDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

interface AgentsListProps {
  agents: Agent[];
  onAgentsChange: (agents: Agent[]) => void;
}

interface AgentReferral {
  id: string;
  name: string;
  email: string;
  today_orders_amount: number;
  yesterday_orders_amount: number;
  monthly_orders_amount: number;
  canceled_orders_amount: number;
  canceled_orders_count: number;
  balance: number;
  commission_rate: number;
  today_withdrawal_amount: number;
  total_withdrawal_amount: number;
}

const AgentsList: React.FC<AgentsListProps> = ({ agents, onAgentsChange }) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showReferralsDialog, setShowReferralsDialog] = useState(false);
  const [referrals, setReferrals] = useState<AgentReferral[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  // 处理代理更新
  const handleAgentUpdated = (updatedAgent: Agent) => {
    const updatedAgents = agents.map(a => a.id === updatedAgent.id ? updatedAgent : a);
    onAgentsChange(updatedAgents);
    toast({
      title: "代理更新成功",
      description: `代理 ${updatedAgent.name} 的信息已更新`
    });
  };

  // 删除代理
  const handleDeleteAgent = async (agent: Agent) => {
    if (confirm(`确定要删除代理 ${agent.name || agent.email} 吗？`)) {
      setIsDeleting(true);
      try {
        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', agent.id);
        
        if (error) throw error;
        
        // 更新代理列表
        const updatedAgents = agents.filter(a => a.id !== agent.id);
        onAgentsChange(updatedAgents);
        
        toast({
          title: "删除成功",
          description: `代理 ${agent.name || agent.email} 已被删除`
        });
      } catch (error) {
        console.error('删除代理错误:', error);
        toast({
          variant: "destructive",
          title: "删除失败",
          description: error instanceof Error ? error.message : "无法删除代理"
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // 加载代理下级数据
  const loadAgentReferrals = async (agent: Agent) => {
    setSelectedAgent(agent);
    setIsLoadingReferrals(true);
    setShowReferralsDialog(true);
    
    try {
      // 假设API返回代理的下级数据
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('parent_agent_id', agent.id);
      
      if (error) throw error;
      
      // 转换数据类型
      const referralData: AgentReferral[] = data.map((item: Record<string, unknown>) => ({
        id: item.id as string,
        name: item.name as string,
        email: item.email as string,
        today_orders_amount: (item.today_orders_amount as number) || 0,
        yesterday_orders_amount: (item.yesterday_orders_amount as number) || 0,
        monthly_orders_amount: (item.monthly_orders_amount as number) || 0,
        canceled_orders_amount: (item.canceled_orders_amount as number) || 0,
        canceled_orders_count: (item.canceled_orders_count as number) || 0,
        balance: (item.balance as number) || 0,
        commission_rate: (item.commission_rate as number) || 0,
        today_withdrawal_amount: (item.today_withdrawal_amount as number) || 0,
        total_withdrawal_amount: (item.total_withdrawal_amount as number) || 0
      }));
      
      setReferrals(referralData);
    } catch (error) {
      console.error('获取下级数据失败:', error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: error instanceof Error ? error.message : "无法加载下级数据"
      });
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  // 格式化金额 - CNY
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // 格式化金额 - USDT
  const formatUsdtAmount = (amount: number) => {
    return `${amount.toFixed(2)} USDT`;
  };

  // 渲染下级代理对话框
  const renderReferralsDialog = () => {
    return (
      <Dialog open={showReferralsDialog} onOpenChange={setShowReferralsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAgent?.name || '代理'} 的下级代理 ({referrals.length})
            </DialogTitle>
            <DialogDescription>
              详细下级用户数据和统计信息
            </DialogDescription>
          </DialogHeader>

          {isLoadingReferrals ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              该代理暂无下级用户
            </div>
          ) : (
            <div className="space-y-6">
              {/* 总体统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">总下级数量</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center">
                      <Users className="h-5 w-5 text-primary mr-2" />
                      {referrals.length}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">下级总订单金额</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      {formatAmount(referrals.reduce((sum, r) => sum + r.monthly_orders_amount, 0))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">下级总提现金额</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 flex items-center">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {formatUsdtAmount(referrals.reduce((sum, r) => sum + r.total_withdrawal_amount, 0))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 下级数据表格 */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>今日订单金额</TableHead>
                      <TableHead>昨日订单金额</TableHead>
                      <TableHead>当月订单金额</TableHead>
                      <TableHead>取消订单金额</TableHead>
                      <TableHead>取消订单笔数</TableHead>
                      <TableHead>账户余额</TableHead>
                      <TableHead>佣金比例</TableHead>
                      <TableHead>今日提现金额</TableHead>
                      <TableHead>总提现金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.name}</TableCell>
                        <TableCell>{referral.email}</TableCell>
                        <TableCell>{formatAmount(referral.today_orders_amount)}</TableCell>
                        <TableCell>{formatAmount(referral.yesterday_orders_amount)}</TableCell>
                        <TableCell>{formatAmount(referral.monthly_orders_amount)}</TableCell>
                        <TableCell>{formatAmount(referral.canceled_orders_amount)}</TableCell>
                        <TableCell>{referral.canceled_orders_count}</TableCell>
                        <TableCell>{formatAmount(referral.balance)}</TableCell>
                        <TableCell>1U = {referral.commission_rate}元</TableCell>
                        <TableCell>{formatUsdtAmount(referral.today_withdrawal_amount)}</TableCell>
                        <TableCell>{formatUsdtAmount(referral.total_withdrawal_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <DialogClose asChild>
              <Button>关闭</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">代理名称</TableHead>
              <TableHead>代理邮箱</TableHead>
              <TableHead>代理下级</TableHead>
              <TableHead>处理中订单</TableHead>
              <TableHead>今日完成订单(金额)</TableHead>
              <TableHead>昨日完成订单(金额)</TableHead>
              <TableHead>历史完成订单(金额)</TableHead>
              <TableHead>今日完成订单(笔数)</TableHead>
              <TableHead>昨日完成订单(笔数)</TableHead>
              <TableHead>历史完成订单(笔数)</TableHead>
              <TableHead>今日取消订单(笔数)</TableHead>
              <TableHead>昨日取消订单(笔数)</TableHead>
              <TableHead>历史取消订单(笔数)</TableHead>
              <TableHead>今日提现金额(USDT)</TableHead>
              <TableHead>昨日提现金额(USDT)</TableHead>
              <TableHead>历史提现金额(USDT)</TableHead>
              <TableHead>当前账户余额(USDT)</TableHead>
              <TableHead>今日汇率</TableHead>
              <TableHead>在线状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
          {agents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={20} className="h-24 text-center">
                暂无代理数据
              </TableCell>
            </TableRow>
          ) : (
            agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell className="font-medium">{agent.name || "代理" + agent.id.slice(0, 4)}</TableCell>
                <TableCell>{agent.email}</TableCell>
                {/* 代理下级 - 可点击查看详情 */}
                <TableCell>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      onClick={() => loadAgentReferrals(agent)}
                    >
                      <Users className="h-3.5 w-3.5 mr-1" />
                      <span className="font-medium">{agent.referral_count || 0}</span>
                      <span className="text-xs ml-1">人</span>
                    </Button>
                  </div>
                </TableCell>
                {/* 处理中订单 */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium text-primary">{agent.processing_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 今日完成订单(金额) */}
                <TableCell>
                  <span className="font-medium text-green-600">{formatAmount(agent.today_orders_amount || 0)}</span>
                </TableCell>
                {/* 昨日完成订单(金额) */}
                <TableCell>
                  <span className="font-medium">{formatAmount(agent.yesterday_orders_amount || 0)}</span>
                </TableCell>
                {/* 历史完成订单(金额) */}
                <TableCell>
                  <span className="font-medium">{formatAmount(agent.total_orders_amount || 0)}</span>
                </TableCell>
                {/* 今日完成订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium text-blue-600">{agent.today_completed_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 昨日完成订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{agent.yesterday_completed_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 历史完成订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{agent.total_completed_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 今日取消订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium text-red-500">{agent.today_canceled_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 昨日取消订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{agent.yesterday_canceled_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 历史取消订单(笔数) */}
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium">{agent.total_canceled_orders_count || 0}</span>
                    <span className="text-xs text-muted-foreground ml-1">笔</span>
                  </div>
                </TableCell>
                {/* 今日提现金额(USDT) */}
                <TableCell>
                  <span className="font-medium text-purple-600">{formatUsdtAmount(agent.today_withdrawal_amount || 0)}</span>
                </TableCell>
                {/* 昨日提现金额(USDT) */}
                <TableCell>
                  <span className="font-medium">{formatUsdtAmount(agent.yesterday_withdrawal_amount || 0)}</span>
                </TableCell>
                {/* 历史提现金额(USDT) */}
                <TableCell>
                  <span className="font-medium">{formatUsdtAmount(agent.total_withdrawal_amount || 0)}</span>
                </TableCell>
                {/* 当前账户余额(USDT) */}
                <TableCell>
                  <span className="font-medium text-green-600">{formatUsdtAmount(agent.balance || 0)}</span>
                </TableCell>
                {/* 今日汇率 */}
                <TableCell>
                  <span className="font-medium text-orange-500">1U = {agent.commission_rate || 7.2}元</span>
                </TableCell>
                {/* 在线状态 */}
                <TableCell>
                  <Badge variant={agent.is_online ? "default" : "outline"} className={agent.is_online ? "bg-green-500 hover:bg-green-500/80" : "text-muted-foreground"}>
                    {agent.is_online ? "在线" : "离线"}
                  </Badge>
                </TableCell>
                {/* 操作 */}
                <TableCell>
                  <div className="flex gap-2">
                    <EditAgentDialog 
                      agent={agent}
                      onAgentUpdated={handleAgentUpdated}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 text-red-500 hover:text-red-500/90"
                      onClick={() => handleDeleteAgent(agent)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      删除
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {renderReferralsDialog()}
      </div>
    </div>
  );
};

export default AgentsList;
