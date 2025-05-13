
import React, { useState, useEffect } from "react";
import { User, UserWallet } from "@/types";
import { Trash2, Coins, Lock, RefreshCw } from "lucide-react";
import { LoadingSpinner, LoadingButton, InlineLoading } from "@/components/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import EditWalletBalanceDialog from "./EditWalletBalanceDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import { getUserWalletByUserId } from "@/services/walletService";
import { toast } from "@/hooks/use-toast";

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onDeleteUser: (userId: string) => void;
  formatDate: (dateString: string) => string;
  onRefetch: () => void;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  isLoading, 
  onDeleteUser, 
  formatDate,
  onRefetch
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [selectedUserEmail, setSelectedUserEmail] = useState<string>("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
  const [walletBalances, setWalletBalances] = useState<Record<string, number | null>>({});
  const [refreshingBalances, setRefreshingBalances] = useState<boolean>(false);
  
  // Fetch wallet balances for all users
  const fetchWalletBalances = async () => {
    if (users.length === 0) return;
    
    try {
      setRefreshingBalances(true);
      const balances: Record<string, number | null> = {};
      
      for (const user of users) {
        try {
          console.log(`Fetching wallet for user: ${user.id} (${user.email})`);
          const wallet = await getUserWalletByUserId(user.id);
          balances[user.id] = wallet?.balance || null;
        } catch (error) {
          console.error(`Error fetching wallet for user ${user.id}:`, error);
          balances[user.id] = null;
        }
      }
      
      setWalletBalances(balances);
      console.log("All wallet balances fetched:", balances);
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      toast({
        title: "获取钱包余额失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setRefreshingBalances(false);
    }
  };
  
  // Initial fetch of wallet balances
  useEffect(() => {
    fetchWalletBalances();
  }, [users]);

  const handleEditBalance = async (userId: string, name: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(name || email);
    setSelectedUserEmail(email);
    setIsLoadingWallet(true);
    
    try {
      const wallet = await getUserWalletByUserId(userId);
      setUserWallet(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      setUserWallet(null);
      toast({
        title: "获取钱包信息失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWallet(false);
      setIsWalletModalOpen(true);
    }
  };
  
  const handleResetPassword = (userId: string, email: string) => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setIsPasswordModalOpen(true);
  };
  
  const handleWalletSuccess = async () => {
    // Refresh all wallet balances after a successful wallet update
    await fetchWalletBalances();
    // Also notify the parent to refetch user data
    onRefetch();
    
    toast({
      title: "钱包余额已更新",
      description: "用户钱包余额已成功更新",
    });
  };

  const handleRefreshBalances = () => {
    fetchWalletBalances();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" text="" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        没有找到用户数据
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          共 {users.length} 个用户
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshBalances}
          disabled={refreshingBalances}
        >
          {refreshingBalances ? (
            <LoadingButton>刷新中...</LoadingButton>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新余额
            </>
          )}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户ID</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>余额</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email || user.id.substring(0, 8)}</TableCell>
                <TableCell>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.first_name || user.last_name || '-'}
                </TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>
                  {walletBalances[user.id] !== undefined 
                    ? walletBalances[user.id] !== null 
                      ? `¥${walletBalances[user.id]?.toFixed(2)}` 
                      : '-' 
                    : <InlineLoading />}
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleEditBalance(
                        user.id, 
                        `${user.first_name || ''} ${user.last_name || ''}`.trim(), 
                        user.email || user.id
                      )}
                    >
                      <Coins className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleResetPassword(user.id, user.email || user.id)}
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除用户 "{user.email || user.id}" 吗？此操作不可撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => onDeleteUser(user.id)}
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Wallet Balance Edit Dialog */}
      {selectedUserId && (
        <EditWalletBalanceDialog
          userId={selectedUserId}
          userName={selectedUserName}
          currentBalance={userWallet?.balance || null}
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          onSuccess={handleWalletSuccess}
        />
      )}
      
      {/* Password Reset Dialog */}
      {selectedUserId && (
        <ResetPasswordDialog
          userId={selectedUserId}
          userEmail={selectedUserEmail}
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </>
  );
};

export default UserTable;
