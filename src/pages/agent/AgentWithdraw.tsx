import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, DollarSign, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types";
import AgentLayout from "@/components/agent/AgentLayout";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// 定义提现记录类型来展示交易数据 - 修改以处理空值情况
type WithdrawalRecord = {
  id: string;
  agent_id: string | null;
  amount: number;
  status: string | null;
  wallet_address: string | null;
  wallet_type: string | null;
  created_at: string | null;
  updated_at?: string | null;
  transaction_hash?: string | null;
  admin_notes?: string | null;
};

export default function AgentWithdraw() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(true);
  
  // 加载提现记录
  const loadWithdrawalRecords = async (agentId: string) => {
    setIsRecordsLoading(true);
    try {
      // 从数据库获取提现记录 - 使用agent_transactions表
      const { data, error } = await supabase
        .from('agent_transactions')
        .select('*')
        .eq('agent_id', agentId)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // 将交易记录转换为提现记录格式
      const formattedRecords: WithdrawalRecord[] = data ? data.map((item: any) => ({
        id: item.id,
        agent_id: item.agent_id,
        amount: item.amount,
        status: item.status,
        wallet_address: agent?.wallet_address || null,
        wallet_type: agent?.wallet_type || 'trc20',
        created_at: item.created_at,
        updated_at: item.updated_at || null,
        transaction_hash: item.transaction_hash || null,
        admin_notes: item.admin_notes || null
      })) : [];
      
      setWithdrawalRecords(formattedRecords);
    } catch (error) {
      console.error("加载提现记录失败:", error);
      toast({
        variant: "destructive",
        title: "数据加载失败",
        description: "无法加载提现记录",
      });
    } finally {
      setIsRecordsLoading(false);
    }
  };
  
  // 提交提现申请
  const submitWithdrawal = async () => {
    if (!agent) return;
    
    // 验证提现金额
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "提现金额无效",
        description: "请输入有效的提现金额",
      });
      return;
    }
    
    if (amountValue < 10) {
      toast({
        variant: "destructive",
        title: "提现金额过小",
        description: "提现金额最小为10 USDT",
      });
      return;
    }
    
    if (amountValue > (agent.total_commission || 0)) {
      toast({
        variant: "destructive",
        title: "余额不足",
        description: "提现金额不能超过可用余额",
      });
      return;
    }
    
    // 验证钱包地址
    if (!agent.wallet_address) {
      toast({
        variant: "destructive",
        title: "未绑定钱包",
        description: "请先绑定您的USDT钱包地址",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 创建提现交易记录 - 只获取error信息
      const { error } = await supabase
        .from('agent_transactions')
        .insert([{
          agent_id: agent.id,
          amount: amountValue,
          type: 'withdrawal',
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      // 重新加载提现记录
      await loadWithdrawalRecords(agent.id);
      
      // 重置表单
      setAmount("");
      
      toast({
        title: "提现申请提交成功",
        description: "您的申请已提交，将在24小时内处理",
      });
    } catch (error) {
      console.error("提交提现申请失败:", error);
      toast({
        variant: "destructive",
        title: "申请提交失败",
        description: "请稍后再试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 返回钱包页面
  const goBack = () => {
    navigate("/agent/wallet");
  };
  
  // 格式化状态显示
  const formatStatus = (status: string | null) => {
    if (!status) return <Badge variant="outline">未知</Badge>;
    
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">处理中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="mr-1 h-3 w-3" />已完成</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="mr-1 h-3 w-3" />已拒绝</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // 加载代理信息
  useEffect(() => {
    const loadAgentData = async () => {
      // 从本地存储获取代理信息
      const agentData = localStorage.getItem("agent");
      if (!agentData) {
        toast({
          variant: "destructive",
          title: "未登录",
          description: "请先登录代理账号",
        });
        navigate("/vip");
        return;
      }
      
      try {
        // 解析代理信息
        const parsedAgent = JSON.parse(agentData) as Agent;
        setAgent(parsedAgent);
        
        // 从数据库获取最新代理信息
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', parsedAgent.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // 更新代理信息
          const updatedAgent = { ...parsedAgent, ...data } as Agent;
          setAgent(updatedAgent);
          
          // 更新本地存储
          localStorage.setItem("agent", JSON.stringify(updatedAgent));
        }
        
        // 加载提现记录
        await loadWithdrawalRecords(parsedAgent.id);
      } catch (error) {
        console.error("加载代理信息失败:", error);
        toast({
          variant: "destructive",
          title: "数据加载失败",
          description: "无法加载代理信息，请重新登录",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAgentData();
  }, [navigate, toast]);
  
  return (
    <AgentLayout>
      <Helmet>
        <title>提现申请 - 代理后台</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">提现申请</h2>
            <p className="text-muted-foreground">
              将您的佣金提现到USDT钱包
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={goBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回钱包
          </Button>
        </div>
        
        {/* 提现表单 */}
        <Card>
          <CardHeader>
            <CardTitle>申请提现</CardTitle>
            <CardDescription>
              您当前的可用余额为 <span className="font-medium">{agent?.total_commission?.toFixed(2) || "0.00"}</span> USDT
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">提现金额</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="最小提现金额 10 USDT"
                      className="pl-10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="10"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    当前绑定的USDT地址: {agent?.wallet_address ? 
                      (<span className="uppercase mr-1 font-mono text-xs">{agent.wallet_type || "trc20"}: {agent.wallet_address.substring(0, 10)}...{agent.wallet_address.substring(agent.wallet_address.length - 6)}</span>) : 
                      (<span className="text-red-500">未绑定，请先在钱包页面绑定地址</span>)
                    }
                  </p>
                </div>
                
                <Button 
                  onClick={submitWithdrawal} 
                  disabled={isSubmitting || !agent?.wallet_address || parseFloat(amount) < 10 || parseFloat(amount) > (agent?.total_commission || 0)} 
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      处理中...
                    </>
                  ) : (
                    "提交提现申请"
                  )}
                </Button>
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm text-amber-800">
                  <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>提现须知：</strong>
                      <ul className="mt-1 list-disc list-inside pl-1 space-y-1">
                        <li>提现将在24小时内处理完成</li>
                        <li>请确保提现地址正确，错误地址导致的损失无法追回</li>
                        <li>大额提现可能需要额外的验证</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 提现记录 */}
        <Card>
          <CardHeader>
            <CardTitle>提现记录</CardTitle>
            <CardDescription>
              查看您的提现申请历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecordsLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : withdrawalRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无提现记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>提现金额</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>提现地址</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.amount.toFixed(2)} USDT
                        </TableCell>
                        <TableCell>
                          {formatDate(record.created_at)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          <span className="uppercase mr-1 bg-muted px-1 py-0.5 rounded text-[10px]">
                            {record.wallet_type || "trc20"}
                          </span>
                          {record.wallet_address ? `${record.wallet_address.substring(0, 6)}...${record.wallet_address.substring(record.wallet_address.length - 4)}` : "-"}
                        </TableCell>
                        <TableCell>
                          {formatStatus(record.status)}
                        </TableCell>
                        <TableCell>
                          {record.admin_notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
}
