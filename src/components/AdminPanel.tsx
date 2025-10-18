import { useState, useEffect } from 'react';
import { Coffee, Plus, Copy, Check, LogOut, Trash2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, InvitationCode } from '../lib/supabase';

export function AdminPanel() {
  const { profile, signOut } = useAuth();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });

  const loadCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCodes(data);
      setStats({
        total: data.length,
        used: data.filter(c => c.is_used).length,
        unused: data.filter(c => !c.is_used).length,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newCode = generateCode();
      const { error } = await supabase
        .from('invitation_codes')
        .insert({
          code: newCode,
          created_by: profile?.id,
        });

      if (error) throw error;
      await loadCodes();
    } catch (error) {
      alert('生成邀请码失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      alert('复制失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个邀请码吗？')) return;

    try {
      const { error } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCodes();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('退出登录失败');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto pt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">管理员控制台</h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {profile?.username}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">全部邀请码</p>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Coffee className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">已使用</p>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.used}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm font-medium">未使用</p>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.unused}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">邀请码管理</h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              {generating ? '生成中...' : '生成新邀请码'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">加载中...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>还没有邀请码，点击上方按钮生成</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    code.is_used
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-bold text-gray-900 font-mono tracking-wider">
                        {code.code}
                      </code>
                      {code.is_used && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg">
                          已使用
                        </span>
                      )}
                      {!code.is_used && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg">
                          可用
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      创建时间: {new Date(code.created_at).toLocaleString('zh-CN')}
                      {code.used_at && ` · 使用时间: ${new Date(code.used_at).toLocaleString('zh-CN')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(code.code, code.id)}
                      className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                      title="复制邀请码"
                    >
                      {copiedId === code.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    {!code.is_used && (
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="p-2 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors"
                        title="删除邀请码"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
