import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPaymentAddresses, createPaymentAddress, updatePaymentAddress, deletePaymentAddress } from "@/services/paymentService";
import { PaymentAddress, PaymentAddressType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PaymentAddressManager = () => {
  const [addresses, setAddresses] = useState<PaymentAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [address, setAddress] = useState("");
  const [type, setType] = useState<PaymentAddressType>("TRC20");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  
  const { toast } = useToast();
  
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentAddresses();
      setAddresses(data);
    } catch (error) {
      console.error("Error fetching payment addresses:", error);
      toast({
        title: "获取支付地址失败",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  
  const handleAddNew = async () => {
    try {
      if (!address.trim()) {
        toast({ title: "请输入钱包地址", variant: "destructive" });
        return;
      }
      
      await createPaymentAddress({
        address,
        type,
        description,
        active
      });
      
      toast({ title: "添加成功" });
      fetchAddresses();
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding payment address:", error);
      toast({
        title: "添加失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdate = async (id: string) => {
    try {
      if (!address.trim()) {
        toast({ title: "请输入钱包地址", variant: "destructive" });
        return;
      }
      
      await updatePaymentAddress(id, {
        address,
        type,
        description,
        active
      });
      
      toast({ title: "更新成功" });
      fetchAddresses();
      resetForm();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating payment address:", error);
      toast({
        title: "更新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除这个支付地址吗？")) return;
    
    try {
      await deletePaymentAddress(id);
      toast({ title: "删除成功" });
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting payment address:", error);
      toast({
        title: "删除失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive"
      });
    }
  };
  
  const startEdit = (address: PaymentAddress) => {
    setEditingId(address.id);
    setAddress(address.address);
    setType(address.type);
    setDescription(address.description || "");
    setActive(address.active);
  };
  
  const resetForm = () => {
    setAddress("");
    setType("TRC20");
    setDescription("");
    setActive(true);
    setEditingId(null);
  };
  
  const cancelEdit = () => {
    resetForm();
    setEditingId(null);
    setShowAddForm(false);
  };
  
  return (
    <Card className="w-full mt-8">
      <CardHeader>
        <CardTitle className="text-xl">充值钱包地址管理</CardTitle>
        <CardDescription>管理用户可以用于充值的钱包地址</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center p-4">加载中...</div>
        ) : (
          <>
            {/* Add new button */}
            {!showAddForm && !editingId && (
              <Button 
                onClick={() => setShowAddForm(true)}
                className="mb-4"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加新地址
              </Button>
            )}
            
            {/* Add form */}
            {showAddForm && !editingId && (
              <div className="border p-4 rounded-md mb-4">
                <h3 className="text-lg font-medium mb-2">添加新地址</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="address">钱包地址</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="输入钱包地址"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="type">类型</Label>
                    <Select value={type} onValueChange={(value) => setType(value as PaymentAddressType)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRC20">TRC20</SelectItem>
                        <SelectItem value="ERC20">ERC20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="description">描述</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="输入描述（可选）"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded"
                      aria-label="启用状态"
                      title="启用此地址"
                    />
                    <Label htmlFor="active">启用</Label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="mr-2 h-4 w-4" />
                      取消
                    </Button>
                    <Button onClick={handleAddNew}>
                      <Check className="mr-2 h-4 w-4" />
                      添加
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Address List */}
            <div className="space-y-4">
              {addresses.length === 0 && !showAddForm ? (
                <div className="text-center p-4 text-muted-foreground">
                  暂无设置的充值地址
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="border p-4 rounded-md">
                    {editingId === addr.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="edit-address">钱包地址</Label>
                          <Input
                            id="edit-address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="edit-type">类型</Label>
                          <Select value={type} onValueChange={(value) => setType(value as PaymentAddressType)}>
                            <SelectTrigger id="edit-type">
                              <SelectValue placeholder="选择类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TRC20">TRC20</SelectItem>
                              <SelectItem value="ERC20">ERC20</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <Label htmlFor="edit-description">描述</Label>
                          <Input
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-active"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="rounded"
                            aria-label="启用状态"
                            title="启用此地址"                            
                          />
                          <Label htmlFor="edit-active">启用</Label>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" onClick={cancelEdit}>
                            <X className="mr-2 h-4 w-4" />
                            取消
                          </Button>
                          <Button onClick={() => handleUpdate(addr.id)}>
                            <Check className="mr-2 h-4 w-4" />
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Badge variant={addr.active ? "default" : "secondary"}>
                              {addr.type}
                            </Badge>
                            <Badge variant={addr.active ? "default" : "outline"} className="ml-2">
                              {addr.active ? "启用" : "禁用"}
                            </Badge>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => startEdit(addr)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">编辑</span>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(addr.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">删除</span>
                            </Button>
                          </div>
                        </div>
                        <div className="break-all text-sm font-mono bg-muted p-2 rounded">
                          {addr.address}
                        </div>
                        {addr.description && (
                          <div className="mt-2 text-sm text-muted-foreground">
                            {addr.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentAddressManager;
