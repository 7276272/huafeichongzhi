import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Loader2, Users, Copy, Share2, QrCode, Wallet, RefreshCw, 
  ClipboardCheck, BarChart4, CreditCard, BadgePercent, 
  Clock, DownloadCloud
} from "lucide-react";
import { Agent, ReferralStats, SubAgentStats } from "@/types";
import { 
  createAgentReferral, 
  getAgentReferralStats, 
  getSubAgentStats, 
  generateQRCodeURL
} from "@/services/agentReferralService";
import { formatDistanceToNow } from "date-fns";
import html2canvas from "html2canvas";

interface ReferralDashboardProps {
  agent: Agent | null;
}

export default function ReferralDashboard({ agent }: ReferralDashboardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [subAgentStats, setSubAgentStats] = useState<SubAgentStats[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [qrCodeURL, setQrCodeURL] = useState("");

  // 加载推广统计数据
  const loadReferralData = useCallback(async () => {
    if (!agent?.id) return;

    try {
      setLoading(true);
      
      // 处理推广码和链接
      let code = "";
      let link = "";
      
      // 如果代理没有推广码，先创建一个
      if (!agent.referral_code) {
        const referralData = await createAgentReferral(agent.id);
        code = referralData.referralCode;
        link = referralData.referralLink;
      } else {
        code = agent.referral_code;
        link = agent.referral_link || window.location.origin + "/register?ref=" + agent.referral_code;
      }
      
      setReferralCode(code);
      setReferralLink(link);
      
      // 生成二维码URL
      const qrUrl = generateQRCodeURL(link);
      setQrCodeURL(qrUrl);
      
      // 获取推广统计数据
      const stats = await getAgentReferralStats(agent.id);
      setReferralStats(stats);
      
      // 获取下级用户统计数据
      const subStats = await getSubAgentStats(agent.id);
      setSubAgentStats(subStats);
    } catch (error) {
      console.error("加载推广数据失败:", error);
      toast({
        variant: "destructive",
        title: "加载失败",
        description: "无法加载推广数据，请稍后重试"
      });
    } finally {
      setLoading(false);
    }
  }, [agent, toast]);

  // 初始加载数据
  useEffect(() => {
    loadReferralData();
  }, [agent, loadReferralData]);

  // 刷新数据
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReferralData();
    setRefreshing(false);
    toast({
      title: "刷新成功",
      description: "推广数据已更新"
    });
  };

  // 复制推广链接
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "复制成功",
        description: "推广链接已复制到剪贴板"
      });
    }).catch(err => {
      console.error("复制失败:", err);
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "无法复制推广链接"
      });
    });
  };

  // 复制推广码
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      toast({
        title: "复制成功",
        description: "推广码已复制到剪贴板"
      });
    }).catch(err => {
      console.error("复制失败:", err);
      toast({
        variant: "destructive",
        title: "复制失败",
        description: "无法复制推广码"
      });
    });
  };

  // 下载二维码图片
  const downloadQRCode = async () => {
    const qrCodeElement = document.getElementById('qrcode-image');
    if (!qrCodeElement) return;

    try {
      const canvas = await html2canvas(qrCodeElement);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${agent?.name || '代理'}_推广二维码.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "下载成功",
        description: "推广二维码已保存"
      });
    } catch (error) {
      console.error("下载二维码失败:", error);
      toast({
        variant: "destructive",
        title: "下载失败",
        description: "无法下载二维码图片"
      });
    }
  };

  // 分享到社交媒体（假设在微信环境下）
  const shareToSocial = () => {
    // 在真实环境中，这里会调用微信的JS SDK或其他分享API
    // 这里只是模拟效果
    toast({
      title: "分享提示",
      description: "请使用浏览器自带的分享功能或手动复制链接分享"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 用户数量 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              下级用户数量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralStats?.referral_user_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              活跃用户: {referralStats?.active_referrals || 0}
            </p>
          </CardContent>
        </Card>

        {/* 充值金额 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              下级充值金额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{referralStats?.total_recharge_amount.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              平均每用户: ¥{referralStats && referralStats.referral_user_count > 0 
                ? (referralStats.total_recharge_amount / referralStats.referral_user_count).toFixed(2) 
                : '0.00'}
            </p>
          </CardContent>
        </Card>

        {/* 代理佣金 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BadgePercent className="mr-2 h-4 w-4" />
              代理佣金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{referralStats?.total_commission_earned.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              佣金率: {agent?.commission_rate ? (agent.commission_rate * 100).toFixed(1) : '0'}%
            </p>
          </CardContent>
        </Card>

        {/* 已提现佣金 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wallet className="mr-2 h-4 w-4" />
              已提现佣金
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{referralStats?.total_commission_withdrawn.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              待结算: ¥{referralStats?.pending_commission.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 推广工具和详细数据标签页 */}
      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools" className="flex items-center">
            <Share2 className="mr-2 h-4 w-4" />
            推广工具
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center">
            <BarChart4 className="mr-2 h-4 w-4" />
            详细数据
          </TabsTrigger>
        </TabsList>

        {/* 推广工具内容 */}
        <TabsContent value="tools" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>推广链接与二维码</CardTitle>
              <CardDescription>
                通过以下方式邀请用户注册并充值，您将获得相应的佣金
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 推广码和链接 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">您的专属推广码</div>
                  <div className="flex">
                    <Input readOnly value={referralCode} className="mr-2" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" onClick={copyReferralCode}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>复制推广码</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">推广链接</div>
                  <div className="flex">
                    <Input readOnly value={referralLink} className="mr-2" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" onClick={copyReferralLink}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>复制链接</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setShowQRDialog(true)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  查看二维码
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={() => setShowShareDialog(true)}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  刷新数据
                </Button>
              </div>

              {/* 推广提示 */}
              <Alert>
                <ClipboardCheck className="h-4 w-4" />
                <AlertTitle>推广说明</AlertTitle>
                <AlertDescription>
                  用户通过您的推广链接注册并充值后，您将获得 {agent?.commission_rate ? (agent.commission_rate * 100).toFixed(1) : '0'}% 的佣金。佣金将在用户充值成功后自动计入您的账户，可在钱包中查看。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 详细数据内容 */}
        <TabsContent value="data" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>下级用户数据</CardTitle>
              <CardDescription>
                查看所有通过您推广注册的用户及其充值情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subAgentStats.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  暂无推广用户数据
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>充值次数</TableHead>
                        <TableHead>充值金额</TableHead>
                        <TableHead>贡献佣金</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subAgentStats.map((stat) => (
                        <TableRow key={stat.user_id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{stat.user_email.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{stat.user_email}</div>
                                <div className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  最近活动: {formatDistanceToNow(new Date(stat.last_activity), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(stat.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{stat.recharge_count}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">¥{stat.recharge_amount.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">¥{stat.commission_generated.toFixed(2)}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 二维码弹窗 */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>推广二维码</DialogTitle>
            <DialogDescription>
              用户扫描此二维码将直接跳转到您的专属推广注册页面
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4" id="qrcode-container">
            <div className="border p-4 rounded-md" id="qrcode-image">
              <img 
                src={qrCodeURL} 
                alt="Referral QR Code" 
                className="mx-auto w-64 h-64" 
              />
              <div className="text-center mt-2 text-sm font-medium">{agent?.name || '代理'}的推广码</div>
              <div className="text-center text-sm">{referralCode}</div>
            </div>
            <Button className="mt-4" onClick={downloadQRCode}>
              <DownloadCloud className="mr-2 h-4 w-4" />
              下载二维码
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 分享弹窗 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>分享推广链接</DialogTitle>
            <DialogDescription>
              选择以下方式分享您的推广链接给潜在用户
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24"
              onClick={copyReferralLink}
            >
              <Copy className="h-8 w-8 mb-2" />
              复制链接
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24"
              onClick={shareToSocial}
            >
              <Share2 className="h-8 w-8 mb-2" />
              分享到社交媒体
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24"
              onClick={() => {
                setShowShareDialog(false);
                setShowQRDialog(true);
              }}
            >
              <QrCode className="h-8 w-8 mb-2" />
              显示二维码
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-24"
              onClick={downloadQRCode}
            >
              <DownloadCloud className="h-8 w-8 mb-2" />
              下载二维码
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
