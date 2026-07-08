import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import { 
  Play, 
  Pause, 
  Settings, 
  Terminal, 
  LogOut, 
  Activity, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Sliders,
  ShieldCheck,
  Power
} from 'lucide-react';

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [user, setUser] = useState(null);
  const [botState, setBotState] = useState('stopped'); // 'running', 'paused', 'stopped'
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), type: 'info', message: 'Client UI initialized.' }
  ]);

  // Fetch current bot state on mount/auth state change
  const fetchBotState = async () => {
    try {
      const response = await fetch(`${backendUrl}/state-check`, {
        credentials: 'include'
      });
      
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Session expired');
      }

      setBotState(data.state || 'stopped');
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'info',
          message: `State sync complete. Bot status is: ${data.state || 'stopped'}.`
        },
        ...prev
      ]);
    } catch (error) {
      console.error("[State Check Error]:", error);
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Failed to sync state: ${error.message}`
        },
        ...prev
      ]);
      // If unauthorized, log out
      if (error.message === 'Session expired' || error.message === 'Unauthorized') {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('username');
    if (email) {
      setUser({ email });
      fetchBotState();
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchBotState();
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    setUser(null);
  };

  // Control Actions
  const startBot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/run-script`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to start bot');
      }
      setBotState(data.state || 'running');
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'success',
          message: `Bot process initiated successfully (State: ${data.state}).`
        },
        ...prev
      ]);
    } catch (error) {
      console.error("[Bot Start Error]:", error);
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Failed to start bot: ${error.message}`
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const pauseBot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/pause-bot`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to pause bot');
      }
      setBotState(data.state || 'paused');
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'warning',
          message: `Bot paused successfully (State: ${data.state}).`
        },
        ...prev
      ]);
    } catch (error) {
      console.error("[Bot Pause Error]:", error);
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Failed to pause bot: ${error.message}`
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resumeBot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/resume-bot`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to resume bot');
      }
      setBotState(data.state || 'running');
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'success',
          message: `Bot resumed successfully (State: ${data.state}).`
        },
        ...prev
      ]);
    } catch (error) {
      console.error("[Bot Resume Error]:", error);
      setLogs(prev => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: 'error',
          message: `Failed to resume bot: ${error.message}`
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Visual helper properties based on state
  const stateConfig = {
    running: {
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-950/10',
      description: 'Bot actively listening to Discord job boards.'
    },
    paused: {
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      bgColor: 'bg-amber-950/10',
      description: 'Bot is paused on standby. Scans are temporarily frozen.'
    },
    stopped: {
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20',
      bgColor: 'bg-rose-950/10',
      description: 'Bot is stopped. Automated scripts are offline.'
    }
  }[botState] || {
    color: 'bg-zinc-500',
    textColor: 'text-zinc-400',
    borderColor: 'border-zinc-500/20',
    bgColor: 'bg-zinc-950/10',
    description: 'Unknown state.'
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">Job Finder</h1>
            <span className="text-[10px] text-zinc-500 font-medium">CONSOLE PANEL v1.0.0</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => fetchBotState()}
            className="flex items-center justify-center p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 cursor-pointer transition-all duration-150"
            title="Sync Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 rounded-lg px-3 py-1.5 text-xs text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{user.email}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-400 cursor-pointer transition-all duration-150"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* Top Control Bar */}
        <div className={`border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 ${stateConfig.borderColor} ${stateConfig.bgColor}`}>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${stateConfig.color} ${botState === 'running' ? 'animate-ping' : ''} relative`}>
              <span className={`absolute inline-flex h-full w-full rounded-full ${stateConfig.color} opacity-75`}></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">System Operations</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900/60 uppercase tracking-wider ${stateConfig.textColor}`}>
                  {botState}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {stateConfig.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {botState === 'stopped' && (
              <button
                onClick={startBot}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white cursor-pointer shadow-lg shadow-indigo-950/20 transition-all duration-200"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                Start Bot
              </button>
            )}

            {botState === 'running' && (
              <button
                onClick={pauseBot}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl bg-amber-600/10 hover:bg-amber-600/15 border border-amber-600/30 text-amber-400 cursor-pointer transition-all duration-200"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-amber-400" />}
                Pause Bot
              </button>
            )}

            {botState === 'paused' && (
              <button
                onClick={resumeBot}
                disabled={loading}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-950/20 transition-all duration-200"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                Resume Bot
              </button>
            )}
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Scans */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 flex items-start gap-4 hover:border-zinc-800 transition-all duration-200">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Scans Today</span>
              <h3 className="text-2xl font-bold text-white mt-1">{botState === 'stopped' ? '0' : '2,845'}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>{botState === 'stopped' ? 'Inactive' : '+12.4% since last hour'}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Applications */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 flex items-start gap-4 hover:border-zinc-800 transition-all duration-200">
            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Auto-Applied</span>
              <h3 className="text-2xl font-bold text-white mt-1">{botState === 'stopped' ? '0' : '42'}</h3>
              <p className="text-[10px] text-violet-400 mt-1 flex items-center gap-1">
                <span>{botState === 'stopped' ? 'Inactive' : '8 pending approval'}</span>
              </p>
            </div>
          </div>

          {/* Card 3: Success Rate */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 flex items-start gap-4 hover:border-zinc-800 transition-all duration-200">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">System Success Rate</span>
              <h3 className="text-2xl font-bold text-white mt-1">{botState === 'stopped' ? '0.0%' : '98.2%'}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">
                {botState === 'stopped' ? 'System offline' : 'Active connection state: stable'}
              </p>
            </div>
          </div>
        </div>

        {/* Logs Console */}
        <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden">
          <div className="border-b border-zinc-900 bg-zinc-900/20 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Live Execution Terminal</h3>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] font-semibold text-zinc-500 hover:text-zinc-300 transition-all duration-150 uppercase tracking-wider cursor-pointer"
            >
              Clear Log
            </button>
          </div>

          <div className="p-6 font-mono text-xs space-y-3 max-h-[300px] overflow-y-auto bg-zinc-950/60">
            {logs.length === 0 ? (
              <div className="text-zinc-600 text-center py-6">Terminal empty. Awaiting events...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-zinc-950 pb-2 last:border-b-0">
                  <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                  <span className={`font-semibold flex-shrink-0 ${
                    log.type === 'success' ? 'text-emerald-500' :
                    log.type === 'warning' ? 'text-amber-500' :
                    log.type === 'error' ? 'text-red-500' : 'text-indigo-400'
                  }`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-zinc-300 break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        © 2026 Job Finder Bot. Operating under secure workspace credentials.
      </footer>
    </div>
  );
}

export default App;
