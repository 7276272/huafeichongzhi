const { createClient } = require('@supabase/supabase-js');

// 从环境变量获取 Supabase 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('请设置环境变量 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addAdmin(email, password) {
  try {
    // 1. 在 Supabase Auth 中创建用户
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      throw new Error(`创建用户失败: ${authError.message}`);
    }

    console.log('用户创建成功:', authData.user.email);

    // 2. 在 admin_users 表中添加管理员记录
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert([
        {
          email: email,
          is_admin: true,
          admin_permissions: ['all'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);

    if (adminError) {
      throw new Error(`添加管理员记录失败: ${adminError.message}`);
    }

    console.log('管理员记录添加成功');

    // 3. 更新 profiles 表中的管理员状态
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profileData?.id) {
      await supabase
        .from('profiles')
        .update({
          is_admin: true,
          admin_permissions: ['all'],
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id);
    }

    console.log('管理员账户创建完成！');
  } catch (error) {
    console.error('创建管理员账户时出错:', error.message);
    process.exit(1);
  }
}

// 使用示例：
// node scripts/add-admin.js admin@example.com your_password
if (require.main === module) {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('用法: node add-admin.js <email> <password>');
    process.exit(1);
  }

  addAdmin(email, password);
}
