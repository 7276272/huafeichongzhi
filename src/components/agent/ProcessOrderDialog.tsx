import { FC, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RechargeOrder } from '@/types';

interface ProcessOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: RechargeOrder;
  onOrderProcessed: (order?: RechargeOrder) => void;
  agentId: string;
}

const ProcessOrderDialog: FC<ProcessOrderDialogProps> = ({ open, onOpenChange, order, onOrderProcessed, agentId }) => {
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'completed' | 'failed'>('completed');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 处理图片上传
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: '无效的文件类型',
        description: '请上传图片文件（JPG, PNG, 等）'
      });
      return;
    }
    
    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: '文件过大',
        description: '请上传5MB以下的图片'
      });
      return;
    }
    
    setImageFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // 上传图片到Supabase存储
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setIsUploading(true);
    try {
      // 创建唯一的文件名
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${order.order_id}_${Date.now()}.${fileExt}`;
      const filePath = `orderproofs/${fileName}`;
      
      // 上传到Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('orderproofs')
        .upload(filePath, imageFile);
      
      if (uploadError) throw uploadError;
      
      // 获取公共URL
      const { data } = supabase.storage
        .from('orderproofs')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('上传图片失败:', error);
      toast({
        variant: 'destructive',
        title: '上传图片失败',
        description: '请稍后重试'
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 处理订单状态变更
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const now = new Date().toISOString();
      
      // 如果选择完成并且有图片，则上传图片
      let proofImageUrl = null;
      if (result === 'completed' && imageFile) {
        proofImageUrl = await uploadImage();
        if (!proofImageUrl && result === 'completed') {
          toast({
            variant: 'destructive',
            title: '上传凭证失败',
            description: '无法上传充值凭证，请重试'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // 更新订单状态
      const { data, error } = await supabase
        .from('recharge_orders')
        .update({
          status: result === 'completed' ? 'completed' : 'failed',
          completed_at: now,
          evidence_url: proofImageUrl,
          note: notes,
          completed_by: agentId
        })
        .eq('id', order.id)
        .select()
        .single();

      if (error) throw error;
      
      // 如果处理成功，计算并更新代理佣金和USDT余额
      if (result === 'completed') {
        // 获取代理信息以获取佣金率、汇率和当前余额
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select('id, name, commission_rate, balance, total_commission, exchange_rate')
          .eq('id', agentId)
          .single();
        
        interface AgentData {
          id: string;
          name: string;
          commission_rate: number; // 佣金率
          balance: number;
          total_commission: number;
          exchange_rate: number; // 汇率: 1 USDT = ? RMB
        }
        
        if (agentError) {
          console.error('获取代理信息失败:', agentError);
          // 继续处理，不要因为更新佣金失败而阻止整个流程
        } else {
          // 计算佣金金额（订单金额 * 佣金率）
          const typedAgentData = agentData as AgentData;
          const commissionRate = typedAgentData.commission_rate || 0.01; // 默认1%佣金率
          const commissionAmount = parseFloat(((order.amount || 0) * commissionRate).toFixed(2));
          
          // 计算USDT金额 (佣金金额 / 汇率)
          // 使用exchange_rate字段作为汇率值
          const exchangeRate = typedAgentData.exchange_rate || 10.0; // 默认汇率: 1 USDT = 10 RMB
          
          // 确保精确计算USDT金额，保留2位小数
          const usdtAmount = parseFloat((commissionAmount / exchangeRate).toFixed(2)); // 只将佣金部分转换为USDT
          
          // 获取当前余额，确保是数字
          const currentBalance = parseFloat((typedAgentData.balance || 0).toFixed(2));
          const currentTotalCommission = parseFloat((typedAgentData.total_commission || 0).toFixed(2));
          
          // 计算USDT余额 - 使用当前余额和汇率计算
          const currentUsdtBalance = parseFloat((currentBalance / exchangeRate).toFixed(2));
          
          // 计算新余额，确保精度
          const newBalance = parseFloat((currentBalance + commissionAmount).toFixed(2));
          const newUsdtBalance = parseFloat((currentUsdtBalance + usdtAmount).toFixed(2));
          const newTotalCommission = parseFloat((currentTotalCommission + commissionAmount).toFixed(2));
          
          console.log(`当前余额: ${currentBalance} RMB, ${currentUsdtBalance} USDT`);
          console.log(`佣金金额: ${commissionAmount} RMB, ${usdtAmount} USDT`);
          console.log(`新余额: ${newBalance} RMB, ${newUsdtBalance} USDT`);
          
          // 更新代理余额和总佣金
          const { error: updateError } = await supabase
            .from('agents')
            .update({
              balance: newBalance,
              total_commission: newTotalCommission
              // 不再更新usdt_balance字段，因为该字段不存在于agents表中
              // USDT余额将根据balance和汇率动态计算
            })
            .eq('id', agentId);
            
          if (updateError) {
            console.error('更新代理佣金和USDT余额失败:', updateError);
          } else {
            console.log(`订单金额: ${order.amount} RMB, 汇率: ${exchangeRate}, USDT金额: ${usdtAmount}, 新USDT余额: ${newUsdtBalance}`);
          }
          
          // 添加佣金记录
          const { error: commissionError } = await supabase
            .from('agent_transactions')
            .insert({
              agent_id: agentId,
              reference_id: order.id,  // agent_transactions表使用reference_id代替order_id
              amount: commissionAmount,
              type: 'commission',      // agent_transactions需要指定交易类型
              status: 'completed',    // agent_transactions需要指定状态
              created_at: now
            });
            
          if (commissionError) {
            console.error('添加佣金记录失败:', commissionError);
          }
          
          // 添加USDT余额变更记录 - 使用agent_transactions表
          const { error: usdtTransactionError } = await supabase
            .from('agent_transactions')
            .insert({
              agent_id: agentId,
              amount: usdtAmount,
              type: 'commission',
              status: 'completed',
              reference_id: order.id,
              description: `订单完成佣金 (USDT), 汇率: 1 USDT = ${exchangeRate} RMB`,
              created_at: now
            });
            
          if (usdtTransactionError) {
            console.error('添加USDT交易记录失败:', usdtTransactionError);
          }
        }
      }

      onOrderProcessed(data);
      onOpenChange(false);
      
      toast({
        title: result === 'completed' ? '订单已完成' : '订单已标记为失败',
        description: result === 'completed' ? 'USDT余额已自动增加，充值已成功完成并上传凭证' : '订单已被标记为充值失败',
        variant: 'default',
      });

    } catch (error) {
      console.error('处理订单失败:', error);
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: '无法更新订单状态，请重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>处理充值订单</DialogTitle>
          <DialogDescription>
            请选择处理结果并添加必要的备注信息。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <h3 className="text-lg font-medium">订单信息</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>订单编号: <span className="font-medium">{order.order_id}</span></div>
              <div>手机号码: <span className="font-medium">{order.phone_number}</span></div>
              <div>充值金额: <span className="font-medium">{order.amount} 元</span></div>
              <div>运营商: <span className="font-medium">{order.carrier}</span></div>
              <div>订单时间: <span className="font-medium">{new Date(order.created_at).toLocaleString()}</span></div>
              <div>状态: <span className="font-medium">{order.status}</span></div>
              {order.city && <div>归属地: <span className="font-medium">{order.city}</span></div>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-base">处理结果</Label>
            <RadioGroup defaultValue="completed" value={result} onValueChange={(value) => setResult(value as 'completed' | 'failed')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  已完成充值
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="failed" id="failed" />
                <Label htmlFor="failed" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  充值失败
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-base">备注</Label>
            <Textarea
              id="notes"
              placeholder="添加备注信息后方便客户查询"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>

          {result === 'completed' && (
            <div className="grid gap-2">
              <Label className="text-base">上传充值凭证</Label>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                    id="proof-image"
                  />
                  <Label htmlFor="proof-image" className="cursor-pointer bg-muted hover:bg-muted/80 px-4 py-2 rounded-md flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    选择图片
                  </Label>
                </div>

                {imagePreview && (
                  <div className="relative border rounded-md overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="充值凭证预览"
                      className="max-h-[200px] object-contain mx-auto p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {!imagePreview && (
                  <div className="border border-dashed rounded-md p-8 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                    <p>上传充值交易凭证截图</p>
                    <p className="text-xs">支持JPG、PNG格式，大小不超过5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading || (result === 'completed' && !imageFile)}
          >
            {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? '上传图片中...' : '提交'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessOrderDialog;
