import { Agent, AgentTransaction } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Define proper Supabase types to fix type errors
// This defines the structure of Supabase query responses

// Define the Supabase query response types
interface SupabaseQueryResponse<T = Record<string, unknown>> {
  data: T | null;
  error: Error | null;
}

// Define a comprehensive interface for the Supabase query builder with result handling
interface SupabaseQueryBuilder {
  select: (columns: string) => SupabaseQueryBuilder;
  eq: (column: string, value: string) => SupabaseQueryBuilder;
  order: (column: string, options: { ascending: boolean }) => SupabaseQueryBuilder;
  single: (options?: { count?: string } | undefined) => Promise<SupabaseQueryResponse<Record<string, unknown>>>;
  limit: (limit: number) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  update: (data: Record<string, unknown>) => SupabaseQueryBuilder;
  insert: (data: Record<string, unknown>[]) => SupabaseQueryBuilder;
  data: Record<string, unknown>[] | null;
  error: Error | null;
}

// Define a version of the query builder that returns query result promises
interface SupabaseQuery extends SupabaseQueryBuilder {
  then: <TResult1 = SupabaseQueryResponse<Record<string, unknown>>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<Record<string, unknown>>) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ) => Promise<TResult1 | TResult2>;
}

// Type guard to check if an object is an Agent
function isAgent(obj: Record<string, unknown>): obj is Agent {
  // 只检查最基本的必需字段，确保不会过滤掉数据库有效数据
  return Boolean(obj && typeof obj === 'object' && 'name' in obj && 'email' in obj);
}

// Helper function to get a typed query builder
function getTable(tableName: string): SupabaseQuery {
  // This type assertion is necessary because Supabase's types don't match our usage
  // We need to bypass TypeScript's type checking for the table names
  // @ts-expect-error - Expect TypeScript errors related to string literal types for table names
  return supabase.from(tableName) as unknown as SupabaseQuery;
}

// 代理登录
export const agentLogin = async (email: string, password: string): Promise<Agent> => {
  try {
    // 验证输入
    if (!email) throw new Error("邮箱不能为空");
    if (!password) throw new Error("密码不能为空");
    
    // 查询代理
    const { data, error } = await getTable('agents')
      .select('*')
      .eq('email', email)
      .eq('password', password) // 将来应该使用哈希值比较
      .single({});
    
    if (error || !data) {
      console.error("Error during agent login:", error);
      throw new Error("邮箱或密码错误");
    }
    
    // 检查代理状态
    if (data && !isAgent(data)) {
      throw new Error("获取到的数据格式不正确");
    }
    
    if (data && typeof data === 'object' && 'status' in data && data.status !== 'active') {
      throw new Error("您的账号已停用，请联系管理员");
    }
    
    // 更新代理登录状态
    await getTable('agents')
      .update({
        is_online: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);
      
    // 不要返回密码
    const returnData = {
      ...data,
      password: undefined
    } as unknown as Agent;
    
    return returnData;
  } catch (error) {
    console.error("Error in agentLogin:", error);
    throw error;
  }
};

// 代理登出
export const agentLogout = async (agentId: string): Promise<boolean> => {
  try {
    // 更新代理在线状态
    const { error } = await getTable('agents')
      .update({
        is_online: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', agentId);
    
    if (error) {
      console.error("Error during agent logout:", error);
      throw new Error("登出失败");
    }
    
    return true;
  } catch (error) {
    console.error("Error in agentLogout:", error);
    throw error;
  }
};

// 获取所有代理列表
export const getAgents = async (): Promise<Agent[]> => {
  try {
    // 使用类型断言来处理Supabase返回的结果
    const { data, error } = await getTable('agents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching agents:", error);
      throw new Error("获取代理列表失败");
    }
    
    if (!data) {
      return [];
    }
    
    // 为每个代理添加随机的代理线数据（模拟数据）
    const agentsWithLines = data.map((agent: Record<string, unknown>) => {
      // 生成一个基于代理ID或零数0-5的随机值
      const stringId = String(agent.id || '');
      const hash = stringId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const lineCount = hash % 6; // 0到5之间的值
      
      return {
        ...agent,
        agent_line_count: lineCount
      } as unknown as Agent;
    });
    
    return agentsWithLines;
  } catch (error) {
    console.error("Error in getAgents:", error);
    throw error;
  }
};

// 获取单个代理信息
export const getAgentById = async (id: string): Promise<Agent | null> => {
  try {
    const { data, error } = await getTable('agents')
      .select('*')
      .eq('id', id)
      .single({});
    
    if (error) {
      console.error("Error fetching agent:", error);
      throw new Error("获取代理信息失败");
    }
    
    return data as Agent;
  } catch (error) {
    console.error("Error in getAgentById:", error);
    throw error;
  }
};

// 添加新代理 - 简化版本
export const addAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at' | 'balance' | 'total_commission'>): Promise<Agent> => {
  try {
    // 基本验证
    if (!agent.name || !agent.email || !agent.phone || !agent.password) {
      throw new Error("所有字段必填");
    }
    
    // 调试信息
    console.log("添加代理", { agent });
    
    // 最简单的数据模型
    const simpleAgent = {
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      password: agent.password,
      commission_rate: agent.commission_rate || 0,
      status: 'active',
      balance: 0,
      total_commission: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 直接插入
    const { data, error } = await getTable('agents')
      .insert([simpleAgent] as unknown as Record<string, unknown>[])
      .select()
      .single({ count: 'exact' });
    
    if (error) {
      console.error("添加代理失败", error);
      throw new Error("添加代理失败: " + error.message);
    }
    
    return data?.[0] as Agent;
  } catch (error) {
    console.error("addAgent错误", error);
    throw error;
  }
};

// 更新代理信息
export const updateAgent = async (id: string, updates: Partial<Omit<Agent, 'id' | 'created_at' | 'updated_at'>>): Promise<Agent> => {
  try {
    // 验证更新内容
    if (updates.commission_rate !== undefined && (updates.commission_rate < 0 || updates.commission_rate > 100)) {
      throw new Error("佣金比例必须在0-100之间");
    }
    
    // 准备更新数据
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // 更新数据库
    const { data, error } = await getTable('agents')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single({ count: 'exact' });
    
    if (error) {
      console.error("Error updating agent:", error);
      throw new Error("更新代理信息失败");
    }
    
    return data as Agent;
  } catch (error) {
    console.error("Error in updateAgent:", error);
    throw error;
  }
};

// 删除代理
export const deleteAgent = async (id: string): Promise<boolean> => {
  try {
    // 检查是否有关联交易
    const { data: transactions, error: checkError } = await getTable('agent_transactions')
      .select('id')
      .eq('agent_id', id)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking agent transactions:", checkError);
      throw new Error("检查代理交易记录失败");
    }
    
    if (transactions && Array.isArray(transactions) && transactions.length > 0) {
      throw new Error("该代理存在交易记录，无法删除");
    }
    
    // 执行删除
    const { error } = await getTable('agents')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting agent:", error);
      throw new Error("删除代理失败");
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteAgent:", error);
    throw error;
  }
};

// 获取代理交易记录
export const getAgentTransactions = async (agentId?: string): Promise<AgentTransaction[]> => {
  try {
    // Use a type assertion for the complex query with joins
    // Using type assertion to bypass Supabase's type constraints for table names
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery = supabase.from('agent_transactions' as any);
    
    // Build the query with proper column selection
    const query = baseQuery.select('*, agents:agents(name)');
    
    // Apply filtering if agentId is provided
    const filteredQuery = agentId ? query.eq('agent_id', agentId) : query;
    
    // Execute the query with proper ordering
    const result = await filteredQuery.order('created_at', { ascending: false });
    const { data, error } = result as { data: Record<string, unknown>[] | null, error: Error | null };
    
    if (error) {
      console.error("Error fetching agent transactions:", error);
      throw new Error("获取代理交易记录失败");
    }
    
    if (!data) {
      return []; // 如果没有数据，返回空数组
    }
    
    // 格式化数据，将agents.name转换为agent_name
    const formattedData = data.map((item: Record<string, unknown>) => {
      const agents = item.agents as { name?: string } | undefined;
      return {
        ...item,
        agent_name: agents?.name || '',
        agents: undefined
      } as unknown as AgentTransaction;
    });
    
    return formattedData;
  } catch (error) {
    console.error("Error in getAgentTransactions:", error);
    throw error;
  }
};

// 添加代理交易记录
export const addAgentTransaction = async (transaction: Omit<AgentTransaction, 'id' | 'created_at' | 'updated_at' | 'agent_name'>): Promise<AgentTransaction> => {
  try {
    // 验证输入
    if (!transaction.agent_id) throw new Error("代理ID不能为空");
    if (!transaction.amount) throw new Error("交易金额不能为空");
    if (!transaction.type) throw new Error("交易类型不能为空");
    
    // 准备新交易数据
    const newTransaction = {
      ...transaction,
      status: transaction.status || "completed" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 开始数据库事务
    const { data, error } = await (supabase.rpc as unknown as (func: string, params: Record<string, unknown>) => Promise<{ data: Record<string, unknown>; error: Error | null }>)('add_agent_transaction', {
      p_agent_id: transaction.agent_id,
      p_amount: transaction.amount,
      p_type: transaction.type,
      p_status: newTransaction.status,
      p_reference_id: transaction.reference_id || null,
      p_description: transaction.description || null
    });
    
    if (error) {
      console.error("Error adding agent transaction:", error);
      throw new Error("添加代理交易记录失败: " + error.message);
    }
    
    return data as unknown as AgentTransaction;
  } catch (error) {
    console.error("Error in addAgentTransaction:", error);
    throw error;
  }
};

// 获取代理统计数据
export const getAgentStats = async (): Promise<{ total: number, active: number, inactive: number }> => {
  try {
    // Using type assertion to handle Supabase query result properly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getTable('agents').select('status') as any;
    const { data, error } = result as { data: Record<string, unknown>[] | null, error: Error | null };
    
    if (error) {
      console.error("Error fetching agent stats:", error);
      throw new Error("获取代理统计数据失败");
    }
    
    // Ensure data is an array before processing
    const agentArray = Array.isArray(data) ? data : [];
    const total = agentArray.length;
    const active = agentArray.filter(agent => typeof agent === 'object' && agent && agent.status === 'active').length;
    const inactive = agentArray.filter(agent => typeof agent === 'object' && agent && agent.status === 'inactive').length;
    
    return { total, active, inactive };
  } catch (error) {
    console.error("Error in getAgentStats:", error);
    throw error;
  }
};
