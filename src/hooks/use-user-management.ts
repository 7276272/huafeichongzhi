
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/services";
import { useQuery } from "@tanstack/react-query";

export const useUserManagement = () => {
  const { toast } = useToast();

  // 获取所有用户
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    // Replace onError with meta.onError for TanStack React Query v5
    meta: {
      onError: (error: Error) => {
        toast({
          title: "获取用户失败",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // 删除用户
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      // 从profiles表中也删除用户
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      toast({
        title: "删除成功",
        description: "用户已成功删除",
      });
      
      refetch();
      
      return true;
    } catch (error) {
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    users: users || [],
    isLoading,
    isError,
    error,
    deleteUser,
    refetchUsers: refetch,
  };
};
