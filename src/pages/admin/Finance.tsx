import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, CheckCircle, XCircle, Loader } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { LoadingButton } from "@/components/ui/LoadingSpinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import {
  getWalletRechargeRequests,
  updateWalletRechargeRequest
} from "@/services/walletService";
import { WalletRechargeRequest } from "@/types";
import Layout from "@/components/AdminLayout";
import PaymentAddressManager from "@/components/admin/PaymentAddressManager";

const Finance = () => {
  const [rechargeRequests, setRechargeRequests] = useState<WalletRechargeRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessingRequest, setIsProcessingRequest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshData = () => {
    fetchData();
  };

  const filteredRequests = rechargeRequests.filter(request => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return searchRegex.test(request.user_email || '') || searchRegex.test(request.amount.toString());
  });

  const handleApproveRechargeRequest = async (id: string) => {
    setIsProcessingRequest(true);
    try {
      await updateWalletRechargeRequest(id, { 
        status: "completed",
        completed_at: new Date().toISOString()
      });
      toast({ title: "请求已批准" });
      refreshData();
    } catch (error) {
      console.error('Error approving recharge request:', error);
      toast({
        title: "处理失败",
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
      await updateWalletRechargeRequest(id, { 
        status: "rejected",
        completed_at: new Date().toISOString()
      });
      toast({ title: "请求已拒绝" });
      refreshData();
    } catch (error) {
      console.error('Error rejecting recharge request:', error);
      toast({
        title: "处理失败",
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
      case "completed":
        return "已完成";
      case "pending":
        return "处理中";
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

  const columns = [
    {
      accessorKey: "user_email",
      header: "用户",
      cell: ({ row }: { row: WalletRechargeRequest }) => {
        return <span>{row.user_email}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: "金额",
      cell: ({ row }: { row: WalletRechargeRequest }) => {
        return <span>{row.amount}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }: { row: WalletRechargeRequest }) => {
        const status = row.status;
        const badgeVariant = getStatusBadgeVariant(status);
        
        return <Badge variant={badgeVariant as "default" | "secondary" | "destructive" | "outline"}>{getStatusText(status)}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: "创建时间",
      cell: ({ row }: { row: WalletRechargeRequest }) => {
        const date = new Date(row.created_at);
        return <span>{date.toLocaleString("zh-CN")}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: WalletRechargeRequest }) => {
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
              <DropdownMenuItem onClick={() => handleApproveRechargeRequest(row.id)} disabled={row.status !== "pending" || isProcessingRequest}>
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
              <DropdownMenuItem onClick={() => handleRejectRechargeRequest(row.id)} disabled={row.status !== "pending" || isProcessingRequest}>
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
      <div className="container mx-auto py-6 sm:py-10 px-3 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">财务管理</h1>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="搜索用户或金额..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="loading-component-centered">
            <LoadingSpinner size="large" text="加载中..." />
          </div>
        ) : loadError ? (
          <div className="rounded-md border p-6 text-center">
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h3 className="mt-4 text-lg font-medium">加载失败</h3>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            <Button className="mt-4" onClick={fetchData}>重试</Button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="rounded-md border p-6 text-center">
            <p className="text-muted-foreground">目前没有充值请求记录</p>
          </div>
        ) : (
          <>
            {/* 桌面端显示表格 */}
            <div className="hidden sm:block">
              <DataTable columns={columns} data={filteredRequests} />
            </div>
            
            {/* 移动端显示卡片列表 */}
            <div className="sm:hidden space-y-4">
              {filteredRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium truncate">{request.user_email}</span>
                    <Badge variant={getStatusBadgeVariant(request.status) as "default" | "secondary" | "destructive" | "outline"}>
                      {getStatusText(request.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">金额:</div>
                    <div>¥{request.amount}</div>
                    
                    <div className="text-gray-500">时间:</div>
                    <div className="text-xs">{new Date(request.created_at).toLocaleString("zh-CN")}</div>
                  </div>
                  
                  {request.status === "pending" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => handleApproveRechargeRequest(request.id)}
                        disabled={isProcessingRequest}
                      >
                        {isProcessingRequest ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            处理...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            批准
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleRejectRechargeRequest(request.id)}
                        disabled={isProcessingRequest}
                      >
                        {isProcessingRequest ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            处理...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            拒绝
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* 钱包充值地址管理 */}
        <div className="mt-8">
          <PaymentAddressManager />
        </div>
      </div>
    </Layout>
  );
};

export default Finance;
