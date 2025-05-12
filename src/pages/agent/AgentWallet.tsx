import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CreditCard, CheckCircle, Send, Link } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types";
import AgentLayout from "@/components/agent/AgentLayout";

export default function AgentWallet() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState("trc20"); // trc20, erc20
  const [copied, setCopied] = useState(false);
  
  // 加载代理信息
  useEffect(() => {
    const loadAgentData = async () => {
      // 获取存储的代理信息
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
        // 解析代理数据
        const parsedAgent = JSON.parse(agentData);
        if (!parsedAgent || !parsedAgent.id) {
          throw new Error("代理信息不完整");
        }
        
        // 从数据库获取最新的代理信息，包括钱包地址
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', parsedAgent.id)
          .single();
        
        if (error) throw error;
        
        // 将数据库返回的数据与本地存储的数据合并
        const updatedAgent: Agent = {
          ...parsedAgent,
          ...data,
          // 确保钱包信息正确初始化
          wallet_address: data.wallet_address || undefined,
          wallet_type: (data.wallet_type as "trc20" | "erc20" | undefined) || "trc20"
        };
        setAgent(updatedAgent);
        
        // 更新本地存储
        localStorage.setItem("agent", JSON.stringify(updatedAgent));
        
        // 设置钱包地址
        if (data.wallet_address) {
          setWalletAddress(data.wallet_address);
        }
        
        // 设置钱包类型 并确保其符合预期值
        if (data.wallet_type && (data.wallet_type === 'trc20' || data.wallet_type === 'erc20')) {
          setWalletType(data.wallet_type);
        }
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
  
  // 保存钱包地址
  const saveWalletAddress = async () => {
    if (!agent) return;
    
    // 验证钱包地址
    if (!walletAddress.trim()) {
      toast({
        variant: "destructive",
        title: "地址无效",
        description: "请输入有效的USDT钱包地址",
      });
      return;
    }
    
    // 验证钱包类型
    const validWalletType = walletType === 'trc20' || walletType === 'erc20' ? walletType : 'trc20';
    
    setIsSaving(true);
    try {
      // 更新数据库
      const { error } = await supabase
        .from('agents')
        .update({
          wallet_address: walletAddress.trim(),
          wallet_type: validWalletType,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id);
      
      if (error) throw error;
      
      // 更新本地代理信息
      const updatedAgent: Agent = {
        ...agent,
        wallet_address: walletAddress.trim(),
        wallet_type: validWalletType as "trc20" | "erc20"
      };
      setAgent(updatedAgent);
      localStorage.setItem("agent", JSON.stringify(updatedAgent));
      
      toast({
        title: "保存成功",
        description: "USDT钱包地址已更新",
      });
    } catch (error) {
      console.error("保存钱包地址失败:", error);
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "无法更新USDT钱包地址，请稍后再试",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // 复制邀请链接
  const copyReferralLink = () => {
    if (!agent?.referral_link) return;
    
    navigator.clipboard.writeText(agent.referral_link);
    setCopied(true);
    
    toast({
      title: "复制成功",
      description: "邀请链接已复制到剪贴板",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  // 跳转到提现页面
  const goToWithdraw = () => {
    navigate("/agent/withdraw");
  };
  
  return (
    <AgentLayout>
      <Helmet>
        <title>代理钱包 - 充值系统</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">代理钱包</h1>
        </div>
        
        {/* 余额卡片 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="w-5 h-5 mr-2" /> 账户余额
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              您的佣金将在这里累积，可随时提现
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <div className="text-sm text-muted-foreground">可提现佣金 (USDT)</div>
                  <div className="text-3xl font-bold mt-1">
                    {(agent?.total_commission || 0).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button onClick={goToWithdraw} className="flex-1" variant="default">
                    <Send className="w-4 h-4 mr-2" /> 申请提现
                  </Button>
                  <Button onClick={copyReferralLink} className="flex-1" variant="outline">
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" /> 已复制邀请链接
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" /> 复制邀请链接
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 钱包地址设置 */}
        <Card>
          <CardHeader>
            <CardTitle>USDT提现地址</CardTitle>
            <CardDescription>
              设置您的USDT钱包地址，佣金将提现到此地址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="trc20" 
                    value="trc20" 
                    checked={walletType === "trc20"} 
                    onChange={() => setWalletType("trc20")} 
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="trc20" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    TRC20（推荐，手续费低）
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="erc20" 
                    value="erc20" 
                    checked={walletType === "erc20"} 
                    onChange={() => setWalletType("erc20")} 
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="erc20" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    ERC20
                  </label>
                </div>
              </div>
              
              <Input
                placeholder="输入您的USDT钱包地址"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                请确保输入正确的地址，错误的地址可能导致资金丢失
              </p>
            </div>
            
            <Button 
              onClick={saveWalletAddress} 
              disabled={isSaving} 
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  保存中...
                </>
              ) : (
                "保存钱包地址"
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* 提示信息 */}
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <h3 className="font-medium text-foreground">提现须知：</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>提现金额最低为10 USDT</li>
                <li>提现将在24小时内处理完成</li>
                <li>如有问题请联系在线客服</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgentLayout>
  );
}
