import { useState } from 'react';
import { Coffee, Phone, User, LogOut, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function MemberCard() {
  const { profile, signOut, updateUsername } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newUsername.trim()) return;

    setSaving(true);
    try {
      await updateUsername(newUsername);
      setIsEditing(false);
    } catch (error) {
      alert('更新用户名失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewUsername(profile?.username || '');
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('退出登录失败');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4">
      <div className="max-w-md mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的会员卡</h1>
          <p className="text-gray-600">享受专属会员权益</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 rounded-3xl shadow-2xl p-8 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">Coffee Shop</p>
                  <p className="text-white/70 text-xs">Premium Member</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-white/70 text-sm mb-1">用户名</p>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1 bg-white/20 backdrop-blur border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="请输入用户名"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="p-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">{profile.username}</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-white/20 backdrop-blur hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <p className="text-white/70 text-sm mb-1">手机号</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <p className="text-lg font-medium">{profile.phone}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20">
                <p className="text-white/70 text-sm mb-1">会员编号</p>
                <p className="text-xs font-mono tracking-wider">{profile.id.slice(0, 18).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">会员权益</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">积分奖励</p>
                <p className="text-sm text-gray-600">每消费1元累积1积分</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">生日特权</p>
                <p className="text-sm text-gray-600">生日当月免费饮品一杯</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coffee className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">专属优惠</p>
                <p className="text-sm text-gray-600">享受会员专属折扣活动</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-white text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  );
}
