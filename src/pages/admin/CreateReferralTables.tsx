import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, ExternalLink } from 'lucide-react';

// SQL脚本内容
const SQL_SCRIPT = `
-- 创建代理短链接表
CREATE TABLE IF NOT EXISTS agent_short_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  short_code VARCHAR(10) NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- 添加索引以提高查询性能
  CONSTRAINT agent_short_links_short_code_idx UNIQUE (short_code)
);

-- 创建链接点击记录表
CREATE TABLE IF NOT EXISTS agent_link_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_link_id UUID NOT NULL REFERENCES agent_short_links(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 添加索引以提高查询性能
  CONSTRAINT agent_link_clicks_agent_id_idx UNIQUE (agent_id, clicked_at)
);

-- 创建推广转化表（记录通过推广链接注册的用户）
CREATE TABLE IF NOT EXISTS agent_referral_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  short_link_id UUID REFERENCES agent_short_links(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 添加索引以提高查询性能
  CONSTRAINT agent_referral_conversions_user_id_idx UNIQUE (user_id)
);
`;

export default function CreateReferralTables() {
  // 下载SQL脚本文件
  const downloadSqlScript = () => {
    const blob = new Blob([SQL_SCRIPT], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'create_agent_referral_tables.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 打开Supabase管理界面
  const openSupabaseInterface = () => {
    window.open('https://eyfkefeyhsrmutvezwxa.supabase.co/project/sql', '_blank');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>创建代理推广表</CardTitle>
          <CardDescription>
            此页面提供代理推广功能所需的数据库表SQL脚本，包括短链接表、点击记录表和转化记录表。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-amber-50 border-amber-200">
            <AlertTitle>注意事项</AlertTitle>
            <AlertDescription>
              由于客户端API限制，无法直接在此页面执行SQL语句。请按照以下步骤手动创建数据库表：
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">步骤 1: 下载SQL脚本</h3>
              <p className="text-sm text-gray-600 mb-4">
                点击下方按钮下载SQL脚本文件，该文件包含创建所有必要表的SQL语句。
              </p>
              <Button onClick={downloadSqlScript} variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                下载SQL脚本
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">步骤 2: 打开Supabase SQL编辑器</h3>
              <p className="text-sm text-gray-600 mb-4">
                登录Supabase管理界面，进入SQL编辑器页面。
              </p>
              <Button onClick={openSupabaseInterface} variant="outline" className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                打开Supabase SQL编辑器
              </Button>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">步骤 3: 执行SQL脚本</h3>
              <p className="text-sm text-gray-600 mb-4">
                在SQL编辑器中，粘贴下载的SQL脚本内容，然后点击"Run"按钮执行。
              </p>
              <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                <pre>{SQL_SCRIPT}</pre>
              </div>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-2">步骤 4: 验证表是否创建成功</h3>
              <p className="text-sm text-gray-600 mb-4">
                执行完成后，在Supabase管理界面的"Table Editor"中，应该能看到以下新表：
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                <li>agent_short_links - 存储代理推广短链接</li>
                <li>agent_link_clicks - 记录链接点击事件</li>
                <li>agent_referral_conversions - 跟踪推广转化</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={downloadSqlScript} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            下载SQL脚本
          </Button>
          <Button onClick={openSupabaseInterface} variant="outline" className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            打开Supabase管理界面
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}