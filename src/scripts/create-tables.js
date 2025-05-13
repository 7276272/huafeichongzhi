// 创建代理推广相关数据库表的脚本
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 从环境变量或配置文件中获取 Supabase 凭据
const supabaseUrl = 'https://eyfkefeyhsrmutvezwxa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZmtlZmV5aHNybXV0dmV6d3hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTkwNDIwOSwiZXhwIjoyMDU1NDgwMjA5fQ.JWzSVG4ImBeF6K_OCekz7w9Kd9FQYPuRk1OAyGn9Uoc';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseKey);

// 读取 SQL 文件内容
const sqlFilePath = path.join(process.cwd(), 'create_agent_referral_tables.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// 将 SQL 文件内容分割成单独的语句
const statements = sqlContent
  .replace(/--.*$/gm, '') // 移除注释
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

// 执行每个 SQL 语句
async function executeStatements() {
  console.log(`准备执行 ${statements.length} 条 SQL 语句...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    try {
      console.log(`执行语句 ${i + 1}/${statements.length}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`执行语句 ${i + 1} 失败:`, error);
      } else {
        console.log(`语句 ${i + 1} 执行成功!`);
      }
    } catch (err) {
      console.error(`执行语句 ${i + 1} 时发生错误:`, err);
    }
  }
  
  console.log('所有语句执行完毕!');
}

// 运行脚本
executeStatements().catch(err => {
  console.error('执行脚本时发生错误:', err);
  process.exit(1);
});
