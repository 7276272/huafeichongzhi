import React, { useState, useEffect } from "react";
import { AdminUser, Agent } from "@/types";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getAgents } from "@/services/agentService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AgentsList from "./AgentsList";
import AddAgentDialog from "./AddAgentDialog";

interface AgentManagementProps {
// 假设存在一个 AdminUser 类型来表示管理员用户，需根据实际情况定义
// 由于导入语句不能放在接口定义内部，将其移到文件开头合适位置，此处移除该导入语句

// 确保 AdminUser 类型已正确导入，这里保留原声明，一般找不到名称问题可能是导入路径或类型定义问题
  currentUser?: AdminUser; // 当前登录的管理员用户
}

const AgentManagement: React.FC<AgentManagementProps> = ({ currentUser }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // 加载代理列表
  useEffect(() => {
    loadAgents();
  }, []);

  // 加载代理数据
  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "加载失败",
        description: error instanceof Error ? error.message : "无法加载代理数据",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新代理列表
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await getAgents();
      setAgents(data);
      toast({
        title: "刷新成功",
        description: "代理列表已更新",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "刷新失败",
        description: error instanceof Error ? error.message : "未知错误",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // 处理添加代理
  const handleAgentAdded = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
  };

  // 处理更新代理
  const handleAgentsChange = (updatedAgents: Agent[]) => {
    setAgents(updatedAgents);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>代理列表</CardTitle>
        <CardDescription>
          查看和管理所有代理账户信息、状态和订单统计
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">
              共 {agents.length} 个代理
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                刷新
              </Button>

              <AddAgentDialog
                onAgentAdded={handleAgentAdded}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AgentsList
              agents={agents}
              onAgentsChange={handleAgentsChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentManagement;
