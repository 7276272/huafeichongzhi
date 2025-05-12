import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { RechargeOrder } from "@/types";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { format } from "date-fns";

interface OrderDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: RechargeOrder | null;
}

// 格式化日期函数
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "yyyy-MM-dd HH:mm:ss");
  } catch (e) {
    return dateString;
  }
};

// 获取订单状态徽章
const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">待处理</span>;
    case "processing":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">处理中</span>;
    case "completed":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">已完成</span>;
    case "failed":
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">失败</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
};

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  order,
}) => {
  // 添加状态控制查看凭证图片的抽屉组件
  const [isImageDrawerOpen, setIsImageDrawerOpen] = useState(false);
  
  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>
              查看订单信息和充值凭证
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">订单号:</span>
              <span className="break-all">{order.order_id}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">手机号码:</span>
              <span>{order.phone_number}</span>
            </div>
            {order.name && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-gray-500">姓名:</span>
                <span>{order.name}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">充值金额:</span>
              <span>¥{order.amount.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">运营商:</span>
              <span>{order.carrier}</span>
            </div>
            {order.province && order.city && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-gray-500">归属地:</span>
                <span>{order.province} {order.city}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">状态:</span>
              <span>{getStatusBadge(order.status)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <span className="text-gray-500">创建时间:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            {order.completed_at && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-gray-500">完成时间:</span>
                <span>{formatDate(order.completed_at)}</span>
              </div>
            )}
            
            {/* 添加查看交易凭证的部分 */}
            {order.proof_image && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <span className="text-gray-500">交易凭证:</span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    className="flex items-center gap-1 text-xs"
                    onClick={() => setIsImageDrawerOpen(true)}
                  >
                    <ImageIcon className="h-4 w-4" />
                    查看凭证
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 查看凭证图片的抽屉组件 */}
      {order.proof_image && (
        <Drawer open={isImageDrawerOpen} onOpenChange={setIsImageDrawerOpen}>
          <DrawerContent className="px-4 pb-6">
            <DrawerHeader>
              <DrawerTitle>交易凭证</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <img 
                src={order.proof_image} 
                alt="交易凭证" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
              <p className="mt-2 text-sm text-gray-500">订单: {order.order_id}</p>
            </div>
            <div className="flex justify-center mt-4">
              <DrawerClose asChild>
                <Button variant="outline">关闭</Button>
              </DrawerClose>
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => window.open(order.proof_image, '_blank')}
              >
                在新窗口打开
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default OrderDetailDialog;
