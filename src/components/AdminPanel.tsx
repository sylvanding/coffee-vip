import { useState, useEffect } from 'react';
import { Coffee, Plus, Copy, Check, LogOut, Trash2, User, X, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, InvitationCode } from '../lib/supabase';

export function AdminPanel() {
  const { profile, signOut } = useAuth();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, used: 0, unused: 0 });
  const [newCodeModal, setNewCodeModal] = useState<string | null>(null);
  const [animatedStats, setAnimatedStats] = useState({ total: 0, used: 0, unused: 0 });

  const loadCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCodes(data);
      const newStats = {
        total: data.length,
        used: data.filter(c => c.is_used).length,
        unused: data.filter(c => !c.is_used).length,
      };
      setStats(newStats);
      animateStats(newStats);
    }
    setLoading(false);
  };

  const animateStats = (targetStats: typeof stats) => {
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedStats({
        total: Math.round(easeOut * targetStats.total),
        used: Math.round(easeOut * targetStats.used),
        unused: Math.round(easeOut * targetStats.unused),
      });

      if (step >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const generateCode = () => {
    // 生成4位数字（0000-9999）
    const code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
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
      setNewCodeModal(newCode);
    } catch (error) {
      alert('Failed to generate invitation code');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(code);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (error) {
      alert('Failed to copy');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation code?')) return;

    try {
      const { error } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCodes();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce-slow">
                  <Coffee className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h1>
                <p className="text-purple-200 flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Welcome back, {profile?.username}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-2xl font-medium transition-all flex items-center gap-2 border border-white/20 hover:scale-105 hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 animate-slide-up border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Total Codes</p>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Coffee className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-bold text-white">{animatedStats.total}</p>
              <TrendingUp className="w-6 h-6 text-blue-100 mb-2" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-100 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide">Used</p>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Check className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-bold text-white">{animatedStats.used}</p>
              <div className="text-emerald-100 text-sm font-medium mb-2">
                {stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300 animate-slide-up animation-delay-200 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-amber-100 text-sm font-semibold uppercase tracking-wide">Available</p>
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-bold text-white">{animatedStats.unused}</p>
              <Plus className="w-6 h-6 text-amber-100 mb-2" />
            </div>
          </div>
        </div>

        {/* Invitation Codes Management */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 animate-slide-up animation-delay-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-300" />
              Invitation Code Management
            </h2>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="group px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center gap-3 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transform disabled:hover:scale-100"
            >
              <Plus className={`w-6 h-6 ${generating ? 'animate-spin' : 'group-hover:rotate-90 transition-transform'}`} />
              {generating ? 'Generating...' : 'Generate New Code'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-purple-200 text-lg">Loading codes...</p>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-16 text-purple-200">
              <Coffee className="w-16 h-16 mx-auto mb-4 text-purple-300 animate-bounce" />
              <p className="text-xl">No invitation codes yet.</p>
              <p className="text-purple-300 mt-2">Click the button above to generate your first one!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {codes.map((code, index) => (
                <div
                  key={code.id}
                  className={`group flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    code.is_used
                      ? 'bg-white/5 border-white/10 hover:bg-white/10'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <code className="text-2xl font-bold text-white font-mono tracking-widest px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                        {code.code}
                      </code>
                      {code.is_used ? (
                        <span className="px-3 py-1 bg-gray-500/30 text-gray-300 text-sm font-bold rounded-lg backdrop-blur-sm">
                          USED
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-500/30 text-emerald-200 text-sm font-bold rounded-lg backdrop-blur-sm animate-pulse">
                          AVAILABLE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-purple-200">
                      Created: {new Date(code.created_at).toLocaleString('en-US', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                      {code.used_at && ` · Used: ${new Date(code.used_at).toLocaleString('en-US', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleCopy(code.code, code.id)}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all hover:scale-110 backdrop-blur-sm group"
                      title="Copy code"
                    >
                      {copiedId === code.id ? (
                        <Check className="w-5 h-5 text-emerald-400 animate-bounce" />
                      ) : (
                        <Copy className="w-5 h-5 text-purple-200 group-hover:text-white" />
                      )}
                    </button>
                    {!code.is_used && (
                      <button
                        onClick={() => handleDelete(code.id)}
                        className="p-3 bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/50 rounded-xl transition-all hover:scale-110 backdrop-blur-sm group"
                        title="Delete code"
                      >
                        <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Code Modal */}
      {newCodeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-purple-400/50 animate-scale-in relative overflow-hidden">
            {/* Sparkle effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
              <div className="absolute top-20 right-20 w-2 h-2 bg-pink-300 rounded-full animate-ping animation-delay-500"></div>
              <div className="absolute bottom-20 left-20 w-2 h-2 bg-blue-300 rounded-full animate-ping animation-delay-1000"></div>
              <div className="absolute bottom-10 right-10 w-2 h-2 bg-purple-300 rounded-full animate-ping animation-delay-1500"></div>
            </div>

            <button
              onClick={() => setNewCodeModal(null)}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-purple-200 hover:text-white" />
            </button>

            <div className="text-center relative z-10">
              <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full mb-6 animate-bounce">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-2">Success!</h3>
              <p className="text-purple-200 mb-6 text-lg">Your new invitation code is ready</p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-purple-400/30">
                <p className="text-purple-200 text-sm mb-2 font-semibold uppercase tracking-wide">Invitation Code</p>
                <code className="text-4xl font-bold text-white font-mono tracking-widest block py-4 animate-pulse">
                  {newCodeModal}
                </code>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleCopy(newCodeModal);
                    setTimeout(() => setNewCodeModal(null), 800);
                  }}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-105 transform shadow-xl"
                >
                  <Copy className="w-5 h-5" />
                  Copy Code
                </button>
                <button
                  onClick={() => setNewCodeModal(null)}
                  className="flex-1 px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/20 hover:scale-105 transform"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-1500 {
          animation-delay: 1500ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.4) rgba(255, 255, 255, 0.05);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 4px 0;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
}
