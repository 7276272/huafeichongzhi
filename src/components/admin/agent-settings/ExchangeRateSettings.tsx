import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// 定义代理数据接口 - 与数据库结构匹配
interface Agent {
  id: string;
  user_id: string | null;
  commission_rate: number | null; // 使用commission_rate字段存储汇率
  is_active: boolean | null;
  referral_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  // 添加其他需要的字段
  // 我们从相关表获取这些用户信息
  name?: string;
  email?: string;
  phone?: string;
}

export default function ExchangeRateSettings() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // 使用useCallback来避免依赖循环
  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: agentsData, error } = await supabase
        .from('agents')
        .select('*');

      if (error) {
        console.error('获取代理列表失败:', error);
        toast({
          title: "加载失败",
          description: "无法获取代理数据，请检查数据库连接",
          variant: "destructive"
        });
        return;
      }

      // 类型安全地转换
      const typedAgents = agentsData as Agent[];

      // 尝试添加用户信息 - 实际应用中需要从用户表获取
      // 这里只是示例代码，为了演示目的
      const agentsWithUserInfo = typedAgents.map(agent => ({
        ...agent,
        name: `代理${agent.id.substring(0, 4)}`, // 示例名称
        email: `agent${agent.id.substring(0, 4)}@example.com`, // 示例邮箱
        phone: `1389999${agent.id.substring(0, 4)}` // 示例电话
      }));

      // 初始化汇率状态 - 使用commission_rate字段
      const initialRates: Record<string, number> = {};
      agentsWithUserInfo.forEach(agent => {
        initialRates[agent.id] = agent.commission_rate || 7.2; // 默认汇率为7.2 (1 USDT = 7.2 RMB)
      });

      setAgents(agentsWithUserInfo);
      setExchangeRates(initialRates);
    } catch (error) {
      console.error('获取代理数据时出错:', error);
      toast({
        title: "加载出错",
        description: "获取代理数据时发生错误，请稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // 依赖toast

  // 加载代理数据
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // 更新汇率值
  const handleExchangeRateChange = (agentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setExchangeRates(prev => ({
        ...prev,
        [agentId]: numValue
      }));
    }
  };

  // 保存单个代理的汇率 - 使用commission_rate字段来存储汇率
  const saveExchangeRate = async (agentId: string) => {
    setIsSaving(prev => ({ ...prev, [agentId]: true }));
    try {
      // 直接更新汇率，不需要先获取代理数据
      const { error } = await supabase
        .from('agents')
        .update({ commission_rate: exchangeRates[agentId] })
        .eq('id', agentId);

      if (error) {
        throw error;
      }

      toast({
        title: "保存成功",
        description: "代理汇率更新成功",
        variant: "default"
      });
    } catch (error) {
      console.error('保存汇率失败:', error);
      toast({
        title: "保存失败",
        description: "无法更新代理汇率，请稍后再试",
        variant: "destructive"
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [agentId]: false }));
    }
  };

  // 过滤代理数据 - 安全地处理可能为空的属性
  const filteredAgents = agents.filter((agent) => {
    return (
      (agent.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (agent.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (agent.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">代理汇率设置</h1>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索代理..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>代理汇率设置</CardTitle>
          <CardDescription>
            为每个代理设置USDT兑换RMB的汇率，影响USDT余额计算
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
              <TableCaption>代理汇率设置 (1 USDT = ? RMB)</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>代理名称</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-48">汇率设置</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      {searchTerm ? '没有找到匹配的代理' : '暂无代理数据'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {agent.id.substring(0, 8)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{agent.email}</div>
                        <div className="text-xs text-muted-foreground">{agent.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                          {agent.is_active ? '活跃' : '未活跃'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="whitespace-nowrap">1 USDT =</span>
                          <Input
                            type="number"
                            step="0.1"
                            min="1"
                            max="10"
                            className="w-24"
                            value={exchangeRates[agent.id]}
                            onChange={(e) => handleExchangeRateChange(agent.id, e.target.value)}
                          />
                          <span className="whitespace-nowrap">RMB</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          onClick={() => saveExchangeRate(agent.id)}
                          disabled={isSaving[agent.id]}
                        >
                          {isSaving[agent.id] ? (
                            <>
                              <div className="h-4 w-4 mr-1 animate-spin rounded-full border-b-2 border-white"></div>
                              保存中
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </>
                          )}
                        </Button>
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
