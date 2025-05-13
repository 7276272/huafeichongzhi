import React, { useEffect, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { Loader2, Home, Wallet, CreditCard } from "lucide-react";
import { Agent } from "@/types";
import { Button } from "@/components/ui/button";

interface AgentLayoutProps {
  children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isAgentChecking, setIsAgentChecking] = useState(true);
  
  // u786eu8ba4u4ee3u7406u767bu5f55u72b6u6001
  useEffect(() => {
    const checkAgentStatus = () => {
      const agentData = localStorage.getItem("agent");
      const agentLoggedIn = localStorage.getItem("agentLoggedIn");
      
      if (!agentData || !agentLoggedIn) {
        toast({
          variant: "destructive",
          title: "未登录",
          description: "请先登录代理账号",
        });
        navigate("/agent/login");
        return;
      }
      
      try {
        setAgent(JSON.parse(agentData));
      } catch (error) {
        console.error("Error parsing agent data:", error);
        localStorage.removeItem("agent");
        localStorage.removeItem("agentLoggedIn");
        navigate("/agent/login");
      } finally {
        setIsAgentChecking(false);
      }
    };
    
    checkAgentStatus();
  }, [navigate, toast]);
  
  // u663eu793au52a0u8f7du4e2du72b6u6001
  if (isAgentChecking) {
    return (
      <Layout>
        <div className="flex h-full min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-500">u6b63u5728u9a8cu8bc1u4ee3u7406u8d26u53f7...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // u4ee3u7406u672au767bu5f55u4e0du5c55u793au5185u5bb9
  if (!agent) {
    return null;
  }
  
  return (
    <Layout>
      <div className="container py-6">
        {/* 导航菜单 */}
        <div className="mb-6 border-b pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <NavLink to="/agent/dashboard" className={({isActive}) => "flex items-center gap-2 px-4 py-2 rounded-md " + (isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Home size={18} />
              <span>控制台</span>
            </NavLink>
            <NavLink to="/agent/wallet" className={({isActive}) => "flex items-center gap-2 px-4 py-2 rounded-md " + (isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Wallet size={18} />
              <span>钱包</span>
            </NavLink>
            <NavLink to="/agent/withdraw" className={({isActive}) => "flex items-center gap-2 px-4 py-2 rounded-md " + (isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <CreditCard size={18} />
              <span>提现</span>
            </NavLink>
            <div className="ml-auto">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground mr-2">{agent.name || '代理'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {children}
      </div>
    </Layout>
  );
};

export default AgentLayout;
