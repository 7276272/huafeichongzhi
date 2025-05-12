
import React from "react";
import { RechargeOrder } from "@/types";
import { Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/components/admin/orderUtils";

interface OrdersTableProps {
  orders: RechargeOrder[];
  onRowClick: (order: RechargeOrder) => void;
  onRefreshPhoneInfo: (orderId: string) => void;
  refreshingOrderId: string | null;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3" />
          待处理
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-300">
          <RefreshCw className="h-3 w-3" />
          处理中
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3" />
          已完成
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-300">
          <XCircle className="h-3 w-3" />
          失败
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  onRowClick, 
  onRefreshPhoneInfo, 
  refreshingOrderId 
}) => {
  return (
    <>
      {/* 桌面端表格视图 */}
      <div className="rounded-md border hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>话费余额</TableHead>
              <TableHead>充值金额</TableHead>
              <TableHead>运营商</TableHead>
              <TableHead>归属地</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onRowClick(order)}
              >
                <TableCell className="font-medium">{order.order_id}</TableCell>
                <TableCell>{order.phone_number}</TableCell>
                <TableCell>
                  {order.balance !== undefined ? `¥${order.balance}` : "-"}
                </TableCell>
                <TableCell>¥{order.amount}</TableCell>
                <TableCell>{order.carrier}</TableCell>
                <TableCell>
                  {order.province && order.city ? `${order.province} ${order.city}` : "-"}
                </TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{formatDate(order.created_at)}</TableCell>
                <TableCell 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefreshPhoneInfo(order.order_id);
                    }}
                    disabled={refreshingOrderId === order.order_id}
                  >
                    <RefreshCw 
                      className={`h-4 w-4 mr-1 ${refreshingOrderId === order.order_id ? 'animate-spin' : ''}`} 
                    />
                    刷新
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  没有找到订单记录
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* 移动端卡片视图 */}
      <div className="sm:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="border rounded-lg p-3 cursor-pointer hover:border-primary"
              onClick={() => onRowClick(order)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-sm truncate max-w-[180px]">{order.order_id}</div>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-y-1 text-sm mb-3">
                <div className="text-gray-500 col-span-1">手机:</div>
                <div className="col-span-2">{order.phone_number}</div>
                
                <div className="text-gray-500 col-span-1">金额:</div>
                <div className="col-span-2">¥{order.amount}</div>
                
                <div className="text-gray-500 col-span-1">运营商:</div>
                <div className="col-span-2">{order.carrier}</div>
                
                {order.balance !== undefined && (
                  <>
                    <div className="text-gray-500 col-span-1">话费余额:</div>
                    <div className="col-span-2">¥{order.balance}</div>
                  </>
                )}
                
                {order.province && order.city && (
                  <>
                    <div className="text-gray-500 col-span-1">归属地:</div>
                    <div className="col-span-2">{order.province} {order.city}</div>
                  </>
                )}
                
                <div className="text-gray-500 col-span-1">时间:</div>
                <div className="col-span-2 text-xs">{formatDate(order.created_at)}</div>
              </div>
              
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-center"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefreshPhoneInfo(order.order_id);
                  }}
                  disabled={refreshingOrderId === order.order_id}
                >
                  <RefreshCw 
                    className={`h-4 w-4 mr-1 ${refreshingOrderId === order.order_id ? 'animate-spin' : ''}`} 
                  />
                  刷新信息
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 border rounded-lg">
            没有找到订单记录
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersTable;
