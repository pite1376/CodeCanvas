import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Code, MessageSquare, Key, Moon, Sun, Menu, X } from 'lucide-react';
import HTMLPreviewer from './components/HTMLPreviewer';
import ChartConverter from './components/ChartConverter';
import AIAssistant from './components/AIAssistant';
import './App.css';

// 神经网络背景组件
const NeuralNetworkBackground: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 节点类
    class Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;

      constructor() {
        if (!canvas) return;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        if (!canvas) return;
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 144, 255, ${this.opacity})`;
        ctx.fill();
        
        // 发光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#1E90FF';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 创建节点
    const nodes: Node[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push(new Node());
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制节点
      nodes.forEach(node => {
        node.update();
        node.draw();
      });

      // 绘制连线
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(30, 144, 255, ${0.3 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: isDarkMode 
        ? 'linear-gradient(135deg, #00008B 0%, #1E1E3F 50%, #2D1B69 100%)' 
        : 'linear-gradient(135deg, #E6F3FF 0%, #CCE7FF 50%, #B3DBFF 100%)' 
      }}
    />
  );
};

// DeepSeek API 配置组件
const DeepSeekConfig: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepseek_api_key') || '');
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('deepseek_base_url') || 'https://api.deepseek.com');

  const saveConfig = () => {
    localStorage.setItem('deepseek_api_key', apiKey);
    localStorage.setItem('deepseek_base_url', baseUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 p-8 rounded-2xl border border-blue-400/30 shadow-2xl backdrop-blur-md max-w-md w-full mx-4 glow-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-100 flex items-center">
            <Key className="mr-3 text-blue-400" size={24} />
            DeepSeek API 配置
          </h2>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white transition-colors p-2 hover:bg-blue-800/30 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 DeepSeek API Key"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-400/30 rounded-lg text-blue-100 placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-blue-200 text-sm font-medium mb-2">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full px-4 py-3 bg-blue-950/50 border border-blue-400/30 rounded-lg text-blue-100 placeholder-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={saveConfig}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              保存配置
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600/50 hover:bg-gray-500/50 text-blue-100 font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              取消
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
          <p className="text-blue-300 text-sm">
            💡 <strong>提示：</strong>您可以在 
            <a 
              href="https://platform.deepseek.com/api_keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline ml-1"
            >
              DeepSeek 平台
            </a> 
            获取 API Key
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentTab, setCurrentTab] = useState<'html' | 'chart' | 'ai'>('html');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showDeepSeekConfig, setShowDeepSeekConfig] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 应用主题到document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.style.backgroundColor = '#0f172a';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.style.backgroundColor = '#ffffff';
    }
  }, [isDarkMode]);

  // 粒子效果
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'html' as const, name: 'HTML预览器', icon: Monitor, description: '实时HTML预览与超高清截图' },
    { id: 'chart' as const, name: '图表转换器', icon: Code, description: 'ECharts & Chart.js 可视化' },
    { id: 'ai' as const, name: 'AI助手', icon: MessageSquare, description: 'DeepSeek V3 智能编程助手' },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'html':
        return <HTMLPreviewer className="flex-1" />;
      case 'chart':
        return <ChartConverter className="flex-1" />;
      case 'ai':
        return <AIAssistant className="flex-1" />;
      default:
        return <HTMLPreviewer className="flex-1" />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} relative overflow-hidden`}>
      {/* 神经网络背景 */}
      <NeuralNetworkBackground isDarkMode={isDarkMode} />
      
      {/* 粒子效果样式 */}
      <style>{`
        .particle {
          position: fixed;
          width: 4px;
          height: 4px;
          background: linear-gradient(45deg, #1E90FF, #9370DB);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: fall linear infinite;
          box-shadow: 0 0 10px #1E90FF;
        }
        
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .glow-border {
          box-shadow: 0 0 20px rgba(30, 144, 255, 0.3), inset 0 0 20px rgba(30, 144, 255, 0.1);
        }
        
        .glow-border:hover {
          box-shadow: 0 0 30px rgba(30, 144, 255, 0.5), inset 0 0 30px rgba(30, 144, 255, 0.2);
        }
        
        .tech-card {
          background: ${isDarkMode 
            ? 'linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(147, 112, 219, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(30, 144, 255, 0.05) 0%, rgba(147, 112, 219, 0.05) 100%)'
          };
          border: 1px solid ${isDarkMode ? 'rgba(30, 144, 255, 0.3)' : 'rgba(30, 144, 255, 0.2)'};
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .tech-card-no-hover {
          background: ${isDarkMode 
            ? 'linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(147, 112, 219, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(30, 144, 255, 0.05) 0%, rgba(147, 112, 219, 0.05) 100%)'
          };
          border: 1px solid ${isDarkMode ? 'rgba(30, 144, 255, 0.3)' : 'rgba(30, 144, 255, 0.2)'};
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* 主容器 */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* 顶部导航栏 */}
        <header className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-100">CodeLab Pro</h1>
                <p className="text-xs text-blue-400">智能开发工具套件</p>
              </div>
            </div>

            {/* 桌面端导航 */}
            <nav className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    currentTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-blue-100 shadow-lg'
                      : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>

            {/* 右侧工具栏 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDeepSeekConfig(true)}
                className="p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30 rounded-lg transition-all duration-300"
                title="DeepSeek API 配置"
              >
                <Key size={20} />
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30 rounded-lg transition-all duration-300"
                title="切换主题"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30 rounded-lg transition-all duration-300"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* 移动端导航菜单 */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-blue-400/30 bg-blue-950/50 backdrop-blur-md">
              <div className="px-4 py-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      currentTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 text-blue-100'
                        : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30'
                    }`}
                  >
                    <tab.icon size={20} />
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs opacity-70">{tab.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-hidden">
          {renderContent()}
        </main>

        {/* 底部状态栏 */}
        <footer className="tech-card-no-hover border-t border-blue-400/30 px-6 py-2 backdrop-blur-md">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-blue-300">
              <span>当前模块: {tabs.find(t => t.id === currentTab)?.name}</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>系统运行正常</span>
            </div>
            <div className="text-blue-400">
              Powered by DeepSeek V3 & React
            </div>
          </div>
        </footer>
      </div>

      {/* DeepSeek 配置弹窗 */}
      <DeepSeekConfig 
        isOpen={showDeepSeekConfig} 
        onClose={() => setShowDeepSeekConfig(false)} 
      />
    </div>
  );
}

export default App;
