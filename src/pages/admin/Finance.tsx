import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, CheckCircle, XCircle, Loader, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getWalletRechargeRequests,
  updateWalletRechargeRequest
} from "@/services/walletService";
import { 
  getAgentWithdrawals,
  updateAgentWithdrawal 
} from "@/services/agentService";
import { WalletRechargeRequest } from "@/types";
import Layout from "@/components/AdminLayout";
import PaymentAddressManager from "@/components/admin/PaymentAddressManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 定义代理提现申请的类型
interface AgentWithdrawal {
  id: string;
  agent_id: string;
  amount: number;
  status: string;
  transaction_hash?: string;
  wallet_address: string;
  wallet_type: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  admin_notes?: string;
  agents?: {
    id: string;
    name: string;
    email: string;
  };
}

const Finance = () => {
  const [rechargeRequests, setRechargeRequests] = useState<WalletRechargeRequest[]>([]);
  const [agentWithdrawals, setAgentWithdrawals] = useState<AgentWithdrawal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // 获取用户充值请求
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      console.log('开始加载财务管理数据...');
      const requests = await getWalletRechargeRequests();
      console.log(`成功获取到 ${requests.length} 条充值请求记录`);
      setRechargeRequests(requests);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching recharge requests:', error);
      setLoadError(error instanceof Error ? error.message : '获取充值请求失败');
      setRechargeRequests([]); // 设置为空数组以避免使用旧数据
      setIsLoading(false);
      toast({
        title: "加载失败",
        description: "获取充值请求失败，请重试",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // 获取代理提现申请
  const fetchAgentWithdrawals = useCallback(async () => {
    setIsLoadingWithdrawals(true);
    setWithdrawalError(null);
    try {
      console.log('开始加载代理提现申请数据...');
      const withdrawals = await getAgentWithdrawals();
      console.log(`成功获取到 ${withdrawals.length} 条代理提现申请记录`);
      // 类型转换以解决类型错误
      setAgentWithdrawals(withdrawals as unknown as AgentWithdrawal[]);
      setIsLoadingWithdrawals(false);
    } catch (error) {
      console.error('Error fetching agent withdrawals:', error);
      setWithdrawalError(error instanceof Error ? error.message : '获取代理提现申请失败');
      setAgentWithdrawals([]); // 设置为空数组以避免使用旧数据
      setIsLoadingWithdrawals(false);
      toast({
        title: "加载失败",
        description: "获取代理提现申请失败，请重试",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // 处理代理提现申请的批准
  const handleApproveWithdrawal = async (id: string) => {
    setIsProcessingRequest(true);
    try {
      // 获取提现申请详情，以便在日志中显示
      const withdrawal = agentWithdrawals.find(w => w.id === id);
      console.log(`尝试批准提现申请: ${id}, 金额: ${withdrawal?.amount}, 代理ID: ${withdrawal?.agent_id}`);
      
      // 调用更新函数
      await updateAgentWithdrawal(id, { status: "completed" });
      
      toast({
        title: "操作成功",
        description: "已批准代理提现申请",
      });
      
      // 重新加载所有提现申请数据，确保数据是最新的
      await fetchAgentWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      toast({
        title: "操作失败",
        description: error instanceof Error ? error.message : "批准代理提现申请失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessingRequest(false);
    }
  };
  
  // 处理代理提现申请的拒绝
  const handleRejectWithdrawal = async (id: string) => {
    setIsProcessingRequest(true);
    try {
      await updateAgentWithdrawal(id, { status: "rejected" });
      toast({
        title: "操作成功",
        description: "已拒绝代理提现申请",
      });
      // 更新本地状态
      setAgentWithdrawals(prev => 
        prev.map(withdrawal => 
          withdrawal.id === id ? { ...withdrawal, status: "rejected" } : withdrawal
        )
      );
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      toast({
        title: "操作失败",
        description: "拒绝代理提现申请失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessingRequest(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAgentWithdrawals();
  }, [fetchData, fetchAgentWithdrawals]);

  const refreshData = () => {
    fetchData();
    fetchAgentWithdrawals();
  };

  const filteredRequests = rechargeRequests.filter(request => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return searchRegex.test(request.user_email || '') || searchRegex.test(request.amount.toString());
  });
  
  const filteredWithdrawals = agentWithdrawals.filter(withdrawal => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return searchRegex.test(withdrawal.agents?.name || '') || 
           searchRegex.test(withdrawal.agents?.email || '') || 
           searchRegex.test(withdrawal.amount.toString()) || 
           searchRegex.test(withdrawal.wallet_address || '');
  });

  const handleApproveRechargeRequest = async (id: string) => {
    setIsProcessingRequest(true);
    try {
      await updateWalletRechargeRequest(id, { status: "completed" });
      toast({
        title: "操作成功",
        description: "已批准充值请求",
      });
      // 更新本地状态
      setRechargeRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status: "completed" } : request
        )
      );
    } catch (error) {
      console.error('Error approving recharge request:', error);
      toast({
        title: "操作失败",
        description: "批准充值请求失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessingRequest(false);
    }
  };

  const handleRejectRechargeRequest = async (id: string) => {
    setIsProcessingRequest(true);
    try {
      await updateWalletRechargeRequest(id, { status: "rejected" });
      toast({
        title: "操作成功",
        description: "已拒绝充值请求",
      });
      // 更新本地状态
      setRechargeRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status: "rejected" } : request
        )
      );
    } catch (error) {
      console.error('Error rejecting recharge request:', error);
      toast({
        title: "操作失败",
        description: "拒绝充值请求失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsProcessingRequest(false);
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "待处理";
      case "completed":
        return "已完成";
      case "rejected":
        return "已拒绝";
      default:
        return status;
    }
  };

  // 获取状态Badge的变体
  const getStatusBadgeVariant = (status: string) => {
    if (status === "completed") {
      return "default";
    } else if (status === "rejected") {
      return "destructive";
    } else if (status === "pending") {
      return "secondary";
    }
    return "outline";
  };

  // 用户充值请求表格列定义
  const rechargeColumns = [
    {
      accessorKey: "user_email",
      header: "用户",
      cell: ({ row }: { row: any }) => {
        return <span>{row.original.user_email}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "金额",
      cell: ({ row }: { row: any }) => {
        return <span>{row.original.amount}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        const badgeVariant = getStatusBadgeVariant(status);
        
        return <Badge variant={badgeVariant as "default" | "secondary" | "destructive" | "outline"}>{getStatusText(status)}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: "创建时间",
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.original.created_at);
        return <span>{date.toLocaleString("zh-CN")}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleApproveRechargeRequest(row.original.id)} disabled={row.original.status !== "pending" || isProcessingRequest}>
                {isProcessingRequest ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    批准
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRejectRechargeRequest(row.original.id)} disabled={row.original.status !== "pending" || isProcessingRequest}>
                {isProcessingRequest ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    拒绝
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  
  // 代理提现申请表格列定义
  const withdrawalColumns = [
    {
      accessorKey: "agent",
      header: "代理",
      cell: ({ row }: { row: any }) => {
        const agent = row.original.agents;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{agent?.name || '未知'}</span>
            <span className="text-xs text-muted-foreground">{agent?.email || '未知邮箱'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "提现金额(USDT)",
      cell: ({ row }: { row: any }) => {
        return <span className="font-medium">{row.original.amount}</span>;
      },
    },
    {
      accessorKey: "wallet_address",
      header: "钱包地址",
      cell: ({ row }: { row: any }) => {
        const address = row.original.wallet_address;
        const type = row.original.wallet_type?.toUpperCase() || 'TRC20';
        return (
          <div className="flex flex-col">
            <span className="text-xs truncate max-w-[150px]">{address}</span>
            <Badge variant="outline" className="mt-1 w-fit">{type}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }: { row: any }) => {
        const status = row.original.status;
        const badgeVariant = getStatusBadgeVariant(status);
        
        return <Badge variant={badgeVariant as "default" | "secondary" | "destructive" | "outline"}>{getStatusText(status)}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: "申请时间",
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.original.created_at);
        return <span>{date.toLocaleString("zh-CN")}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleApproveWithdrawal(row.original.id)} disabled={row.original.status !== "pending" || isProcessingRequest}>
                {isProcessingRequest ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    批准
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRejectWithdrawal(row.original.id)} disabled={row.original.status !== "pending" || isProcessingRequest}>
                {isProcessingRequest ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    拒绝
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">财务管理</h1>
          <div className="flex space-x-2">
            <Input
              placeholder="搜索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>

        <Tabs defaultValue="recharge" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="recharge">用户充值请求</TabsTrigger>
            <TabsTrigger value="withdrawals">代理提现申请</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recharge">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {rechargeColumns.map((column) => (
                      <TableHead key={column.accessorKey || column.id}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={rechargeColumns.length} className="h-24 text-center">
                        <Loader className="h-6 w-6 mx-auto animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={rechargeColumns.length} className="h-24 text-center">
                        没有找到充值请求
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        {rechargeColumns.map((column) => (
                          <TableCell key={column.accessorKey || column.id}>
                            {column.cell ? column.cell({ row: { original: request } }) : (column.accessorKey ? String(request[column.accessorKey as keyof WalletRechargeRequest] || '') : '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="withdrawals">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {withdrawalColumns.map((column) => (
                      <TableHead key={column.accessorKey || column.id}>
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingWithdrawals ? (
                    <TableRow>
                      <TableCell colSpan={withdrawalColumns.length} className="h-24 text-center">
                        <Loader className="h-6 w-6 mx-auto animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : filteredWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={withdrawalColumns.length} className="h-24 text-center">
                        没有找到提现申请
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        {withdrawalColumns.map((column) => (
                          <TableCell key={column.accessorKey || column.id}>
                            {column.cell ? column.cell({ row: { original: withdrawal } }) : (column.accessorKey ? String(withdrawal[column.accessorKey as keyof AgentWithdrawal] || '') : '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 钱包充值地址管理 */}
        <div className="mt-8">
          <PaymentAddressManager />
        </div>
      </div>
    </Layout>
  );
};

export default Finance;
