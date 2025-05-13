import { useState, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// 定义代理数据接口
interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  exchange_rate: number; // 添加汇率字段
  created_at: string;
  updated_at: string;
}

// 定义代理报表数据接口
interface AgentReport {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  referral_count: number;
  referral_amount: number;
  withdrawal_amount: number;
  commission_earned: number;
  commission_withdrawn: number;
  usdt_balance: number; // 新增：USDT余额 - 根据充值金额和汇率计算
  last_active: string;
  created_at: string;
}

// 定义佣金交易的接口
interface AgentCommission {
  id: string;
  agent_id: string;
  amount: number;
  status: string;
  created_at: string;
}

// 定义引用数据接口
interface AgentReferral {
  id: string;
  agent_id: string;
  referred_user_id: string;
  status: string;
}

interface RechargeOrder {
  id: string;
  user_id: string;
  amount: number;
  status: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
}

export default function AgentReportsTable() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // 加载代理报表数据
  useEffect(() => {
    fetchAgentReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取代理报表数据
  const fetchAgentReports = async () => {
    setIsLoading(true);
    try {
      console.log('开始获取代理数据...');
      
      // 使用类型断言解决Supabase类型问题
      const { data: agentsData, error } = await supabase
        // @ts-expect-error Supabase模式定义中不包含agents表
        .from('agents')
        .select('*');
      
      console.log('代理数据查询结果:', { count: agentsData?.length, error });
      
      // 使用类型断言，先转换为unknown再转换为具体类型
      const agents = agentsData as unknown as Agent[];

      if (error) {
        console.error('获取代理列表失败:', error);
        setIsLoading(false);
        setReports([]);
        toast({
          title: "加载失败",
          description: "无法获取代理数据，请检查数据库连接",
          variant: "destructive"
        });
        return;
      }

      // 记录获取数据的结果
      console.log('获取代理数据结果:', { agents, error });

      if (error) {
        console.error('获取代理列表失败:', error);
        toast({
          title: "获取数据失败",
          description: "无法获取代理列表，请稍后再试",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (!agents || agents.length === 0) {
        console.log('没有找到代理数据');
        setReports([]);
        setIsLoading(false);
        return;
      }

      // 如果发现有代理数据
      console.log(`找到 ${agents.length} 个代理，开始获取详细数据...`);

      // 尝试判断agent_referrals表是否存在
      try {
        // 直接使用别名避免未使用变量警告
        // @ts-expect-error Supabase模式定义中不包含agent_referrals表
        const { error: tableCheckError } = await supabase
          .from('agent_referrals')
          .select('id')
          .limit(1);

        if (tableCheckError) {
          console.error('agent_referrals 表可能不存在:', tableCheckError);
          // 显示基本代理信息，不包含引用统计
          const basicReports = agents.map(agent => ({
            id: agent.id || '',
            name: agent.name || '未知代理',
            email: agent.email || '',
            phone: agent.phone || '',
            status: agent.status || 'inactive',
            // 设置默认值
            referral_count: 0,
            referral_amount: 0,
            withdrawal_amount: 0,
            commission_earned: 0,
            commission_withdrawn: 0,
            usdt_balance: 0, // 添加默认USDT余额为0
            last_active: agent.updated_at || agent.created_at || new Date().toISOString(),
            created_at: agent.created_at || new Date().toISOString()
          } as AgentReport));
          
          setReports(basicReports);
          setIsLoading(false);
          toast({
            title: "数据加载受限",
            description: "无法获取完整的代理统计数据，请联系系统管理员",
            variant: "destructive"
          });
          return;
        }
      } catch (e) {
        console.error('检查agent_referrals表时出错:', e);
        // 显示基本代理信息，不包含引用统计
        const basicReports = agents.map(agent => ({
          id: agent.id || '',
          name: agent.name || '未知代理',
          email: agent.email || '',
          phone: agent.phone || '',
          status: agent.status || 'inactive',
          // 设置默认值
          referral_count: 0,
          referral_amount: 0,
          withdrawal_amount: 0,
          commission_earned: 0,
          commission_withdrawn: 0,
          usdt_balance: 0, // 添加默认USDT余额为0
          last_active: agent.updated_at || agent.created_at || new Date().toISOString(),
          created_at: agent.created_at || new Date().toISOString()
        } as AgentReport));
        
        setReports(basicReports);
        setIsLoading(false);
        return;
      }

      // 处理每个代理的详细数据
      const reportsData = await Promise.all(agents.map(async (agent: Agent) => {
        // 获取下级用户数量
        // @ts-expect-error Supabase模式定义中不包含agent_referrals表
        const { data: referralsData, error: referralsError } = await supabase
          .from('agent_referrals')
          .select('*')
          .eq('agent_id', agent.id);

        if (referralsError) {
          console.error('获取代理引荐用户失败:', referralsError);
          return null;
        }

        // 获取下级用户IDs - 处理类型问题
        const referrals = referralsData as unknown as AgentReferral[];
        const userIds = referrals.map(ref => ref.referred_user_id) || [];
        console.log(`代理 ${agent.name} (${agent.id}) 有 ${userIds.length} 个下级用户`);

        // 计算充值金额和提现金额
        let rechargeAmount = 0;
        let withdrawalAmount = 0;

        if (userIds && userIds.length > 0) {
          // 获取充值数据
          // @ts-expect-error Supabase模式定义中不包含recharge_orders表
          const { data: rechargesData, error: rechargesError } = await supabase
            .from('recharge_orders')
            .select('amount')
            .in('user_id', userIds)
            .eq('status', 'completed');

          if (rechargesError) {
            console.error('获取充值数据失败:', rechargesError);
          } else if (rechargesData) {
            // 将数据转换为RechargeOrder类型
            const recharges = rechargesData as RechargeOrder[];
            rechargeAmount = recharges.reduce((total, order) => total + (order.amount || 0), 0);
            console.log(`代理 ${agent.name} 的下级充值总额: ${rechargeAmount}`);
          }

          // 获取提现数据
          // @ts-expect-error Supabase模式定义中不包含wallet_transactions表
          const { data: withdrawalsData, error: withdrawalsError } = await supabase
            .from('wallet_transactions')
            .select('amount')
            .in('user_id', userIds)
            .eq('type', 'withdrawal')
            .eq('status', 'completed');

          if (withdrawalsError) {
            console.error('获取提现数据失败:', withdrawalsError);
          } else if (withdrawalsData) {
            // 将数据转换为WalletTransaction类型
            const withdrawals = withdrawalsData as WalletTransaction[];
            withdrawalAmount = withdrawals.reduce((total, tx) => total + (tx.amount || 0), 0);
            console.log(`代理 ${agent.name} 的下级提现总额: ${withdrawalAmount}`);
          }
        }

        // 获取佣金信息
        // @ts-expect-error Supabase模式定义中不包含agent_transactions表 (之前错误地使用了agent_commissions)
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('agent_transactions')
          .select('*')
          .eq('agent_id', agent.id);

        if (commissionsError) {
          console.error('获取佣金数据失败:', commissionsError);
          return null;
        }

        // 分别计算佣金总额和已提现佣金
        let commissionEarned = 0;
        let commissionWithdrawn = 0;

        if (commissionsData) {
          // 统计所有佣金和已提现佣金
          const commissions = commissionsData as AgentCommission[];
          commissions.forEach(commission => {
            if (commission.status === 'completed') {
              commissionEarned += Number(commission.amount) || 0;
            }
            if (commission.status === 'withdrawn') {
              commissionWithdrawn += Number(commission.amount) || 0;
            }
          });
        }
        
        // 使用代理的自定义汇率或默认汇率
        const DEFAULT_EXCHANGE_RATE = 0.14; // 默认汇率
        const agentExchangeRate = agent.exchange_rate || DEFAULT_EXCHANGE_RATE;
        const usdtBalance = rechargeAmount * agentExchangeRate;
        console.log(`代理 ${agent.name} 的USDT余额: ${usdtBalance.toFixed(2)} (汇率: ${agentExchangeRate})`);

        // 返回完整的代理报表数据
        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          status: agent.status,
          referral_count: userIds.length,
          referral_amount: rechargeAmount,
          withdrawal_amount: withdrawalAmount,
          commission_earned: commissionEarned,
          commission_withdrawn: commissionWithdrawn,
          usdt_balance: usdtBalance, // 添加USDT余额字段
          last_active: agent.updated_at || agent.created_at || new Date().toISOString(),
          created_at: agent.created_at || new Date().toISOString()
        } as AgentReport;
      }));

      // 设置报表数据并结束加载状态
      setReports(reportsData.filter(Boolean) as AgentReport[]);
      setIsLoading(false);

    } catch (error) {
      console.error('获取代理报表失败:', error);
      toast({
        title: "获取数据失败",
        description: "无法处理代理报表数据，请稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤代理数据
  const filteredReports = reports.filter((report) => {
    return (
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.phone.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // 导出Excel报表
  const exportToExcel = () => {
    // 导出功能，后续可以实现具体的Excel导出
    alert('导出功能将在后续实现');
    toast({
      title: "功能提示",
      description: "导出功能将在后续版本中实现"
    });
  };

  return (
    <div className="space-y-4">
      {/* 搜索和导出 */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索代理..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={exportToExcel} disabled={isLoading || reports.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          导出报表
        </Button>
      </div>

      {/* 代理数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>代理数据报表</CardTitle>
          <CardDescription>
            显示每个代理的下级用户数据和财务统计
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="ml-2">加载中...</span>
            </div>
          ) : (
            <Table>
              <TableCaption>截至 {new Date().toLocaleDateString()} 的代理数据</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>代理名称</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">下级用户数</TableHead>
                  <TableHead className="text-right">下级充值金额</TableHead>
                  <TableHead className="text-right">下级提现金额</TableHead>
                  <TableHead className="text-right">USDT余额</TableHead>
                  <TableHead className="text-right">佣金及提现</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      {searchTerm ? '没有找到匹配的代理' : '暂无代理数据'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">
                          注册: {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{report.email}</div>
                        <div className="text-xs text-muted-foreground">{report.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                          {report.status === 'active' ? '活跃' : '未活跃'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">{report.referral_count}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-green-600">¥{report.referral_amount.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-orange-600">¥{report.withdrawal_amount.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-blue-600">$ {report.usdt_balance?.toFixed(2) || '0.00'}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium">¥{report.commission_earned.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">
                          已提: ¥{report.commission_withdrawn.toFixed(2)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
