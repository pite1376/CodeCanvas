import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Zap, X, ChevronDown, ChevronUp, Code, Wand2, AlertTriangle, Sparkles, Bot, User, Settings } from 'lucide-react';

interface AIAssistantProps {
  className?: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error';
  attachments?: string[];
}

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  category: string;
}

interface OptimizationOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

interface DiagnosticOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ className }) => {
  // 消息状态
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '🚀 你好！我是基于 DeepSeek V3 的AI编程助手，专门帮助你解决代码问题、优化程序性能、生成图表配置等。有什么我可以帮助你的吗？',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  
  // 输入状态
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 快捷功能面板状态
  const [showQuickPanel, setShowQuickPanel] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompts' | 'optimization' | 'diagnostic'>('prompts');
  
  // DeepSeek API 配置
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepseek_api_key') || '');
  const [isConnected, setIsConnected] = useState(!!apiKey);
  
  // 自动调整输入框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);
  
  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 检查API配置
  useEffect(() => {
    const key = localStorage.getItem('deepseek_api_key');
    setApiKey(key || '');
    setIsConnected(!!key);
  }, []);
  
  // 调用DeepSeek API
  const callDeepSeekAPI = async (prompt: string): Promise<string> => {
    const apiKey = localStorage.getItem('deepseek_api_key');
    const baseUrl = localStorage.getItem('deepseek_base_url') || 'https://api.deepseek.com';
    
    if (!apiKey) {
      return '❌ 请先配置 DeepSeek API Key。点击右上角的钥匙图标进行配置。';
    }
    
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的编程助手，擅长HTML、CSS、JavaScript、React、图表库(ECharts、Chart.js)等前端技术。请用中文回答，提供准确、实用的建议和代码示例。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: false,
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || '抱歉，我没有收到有效的响应。';
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error);
      return `❌ API调用失败: ${error instanceof Error ? error.message : '未知错误'}`;
    }
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const currentInput = inputValue;
    
    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
      status: 'sending'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // 更新用户消息状态为已发送
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    }, 500);
    
    // 调用DeepSeek API
    try {
      const aiResponse = await callDeepSeekAPI(currentInput);
      
      setIsTyping(false);
      
      // 添加AI响应
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        status: 'sent'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '❌ 抱歉，处理您的请求时出现了错误。请稍后重试。',
        timestamp: new Date(),
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };
  
  // 处理输入框按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 切换语音输入
  const toggleVoiceInput = () => {
    setIsRecording(!isRecording);
    // 实际应用中这里会有语音识别API的调用
  };
  
  // 切换快捷功能面板
  const toggleQuickPanel = () => {
    setShowQuickPanel(!showQuickPanel);
  };
  
  // 应用提示词模板
  const applyPromptTemplate = (template: PromptTemplate) => {
    setInputValue(template.content);
    setShowQuickPanel(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // 模拟提示词模板
  const promptTemplates: PromptTemplate[] = [
    {
      id: '1',
      title: '代码解释',
      description: '解释一段代码的功能和逻辑',
      content: '请解释以下代码的功能和工作原理：\n\n```\n// 在此粘贴代码\n```',
      icon: <Code size={16} />,
      category: '代码分析'
    },
    {
      id: '2',
      title: 'HTML优化',
      description: '优化HTML结构和语义',
      content: '请帮我优化以下HTML代码，提高语义化和可访问性：\n\n```html\n<!-- 在此粘贴HTML代码 -->\n```',
      icon: <Wand2 size={16} />,
      category: '代码优化'
    },
    {
      id: '3',
      title: '图表配置',
      description: '生成图表配置代码',
      content: '请帮我生成一个ECharts图表配置，要求：\n1. 类型：\n2. 数据：\n3. 样式要求：',
      icon: <Sparkles size={16} />,
      category: '图表生成'
    },
    {
      id: '4',
      title: '性能分析',
      description: '分析代码性能瓶颈',
      content: '请分析以下代码的性能问题并提供优化建议：\n\n```\n// 在此粘贴代码\n```',
      icon: <Zap size={16} />,
      category: '性能优化'
    }
  ];
  
  // 代码优化选项
  const optimizationOptions: OptimizationOption[] = [
    {
      id: '1',
      title: '格式化代码',
      icon: <Code size={16} />,
      action: () => {
        setInputValue(prev => prev + '\n\n请帮我格式化以下代码：\n\n```\n// 在此粘贴代码\n```');
        setShowQuickPanel(false);
      }
    },
    {
      id: '2',
      title: '优化性能',
      icon: <Zap size={16} />,
      action: () => {
        setInputValue(prev => prev + '\n\n请帮我优化以下代码的性能：\n\n```\n// 在此粘贴代码\n```');
        setShowQuickPanel(false);
      }
    },
    {
      id: '3',
      title: '添加注释',
      icon: <Wand2 size={16} />,
      action: () => {
        setInputValue(prev => prev + '\n\n请为以下代码添加详细的注释：\n\n```\n// 在此粘贴代码\n```');
        setShowQuickPanel(false);
      }
    }
  ];
  
  // 错误诊断选项
  const diagnosticOptions: DiagnosticOption[] = [
    {
      id: '1',
      title: '语法检查',
      icon: <Code size={16} />,
      action: () => {
        setInputValue(prev => prev + '\n\n请检查以下代码的语法错误：\n\n```\n// 在此粘贴代码\n```');
        setShowQuickPanel(false);
      }
    },
    {
      id: '2',
      title: '逻辑错误分析',
      icon: <AlertTriangle size={16} />,
      action: () => {
        setInputValue(prev => prev + '\n\n请分析以下代码可能存在的逻辑错误：\n\n```\n// 在此粘贴代码\n```');
        setShowQuickPanel(false);
      }
    }
  ];
  
  // 格式化时间戳
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // 渲染消息状态图标
  const renderStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <span className="text-blue-400 text-xs animate-pulse">发送中...</span>;
      case 'error':
        return <span className="text-red-400 text-xs">发送失败</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className={`flex flex-col h-full ${className} relative`}>
      {/* 科技风格背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-purple-950/30 to-blue-900/50 backdrop-blur-sm"></div>
      
      {/* API连接状态指示器 */}
      <div className="relative z-10 p-4 border-b border-blue-400/30 bg-blue-950/30 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-blue-100 text-sm font-medium">
              {isConnected ? 'DeepSeek V3 已连接' : 'DeepSeek API 未配置'}
            </span>
          </div>
          {!isConnected && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openDeepSeekConfig'))}
              className="text-blue-400 hover:text-blue-300 text-sm underline flex items-center space-x-1"
            >
              <Settings size={14} />
              <span>配置API</span>
            </button>
          )}
        </div>
      </div>
      
      {/* 对话区域 */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`flex mb-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 头像 */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-3 shadow-lg shadow-blue-500/25' 
                    : 'bg-gradient-to-r from-green-400 to-blue-500 text-white mr-3 shadow-lg shadow-green-500/25'
                }`}>
                  {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                {/* 消息气泡 */}
                <div 
                  className={`relative px-4 py-3 rounded-2xl backdrop-blur-md border ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white rounded-br-md border-blue-400/30 shadow-lg shadow-blue-500/20' 
                      : 'bg-blue-950/60 text-blue-100 rounded-bl-md border-blue-400/30 shadow-lg shadow-blue-500/10'
                  }`}
                >
                  {/* 消息内容 */}
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  
                  {/* 附件区域 */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="text-sm opacity-80 underline">
                          📎 {attachment}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 时间戳和状态 */}
                  <div className={`flex justify-between items-center mt-2 text-xs opacity-70 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-blue-300'
                  }`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    {renderStatusIcon(message.status)}
                  </div>
                  
                  {/* 气泡尖角 */}
                  <div className={`absolute top-4 w-0 h-0 ${
                    message.type === 'user' 
                      ? 'right-[-8px] border-l-8 border-l-purple-600/80 border-t-8 border-t-transparent border-b-8 border-b-transparent' 
                      : 'left-[-8px] border-r-8 border-r-blue-950/60 border-t-8 border-t-transparent border-b-8 border-b-transparent'
                  }`} />
                </div>
              </div>
            </div>
          ))}
          
          {/* AI正在输入指示器 */}
          {isTyping && (
            <div className="flex justify-start mb-6 animate-fadeIn">
              <div className="flex items-start max-w-[80%]">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white mr-3 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Bot size={20} />
                </div>
                <div className="bg-blue-950/60 px-4 py-3 rounded-2xl rounded-bl-md backdrop-blur-md border border-blue-400/30 shadow-lg shadow-blue-500/10">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 快捷功能面板 */}
      {showQuickPanel && (
        <div className="relative z-10 border-t border-blue-400/30 bg-blue-950/40 backdrop-blur-md">
          <div className="flex justify-between items-center px-6 py-3 bg-blue-950/50">
            <h3 className="font-semibold text-blue-100 flex items-center">
              <Sparkles size={18} className="mr-2 text-blue-400" />
              快捷功能
            </h3>
            <button 
              className="p-2 rounded-lg hover:bg-blue-800/30 transition-colors text-blue-300 hover:text-blue-100"
              onClick={() => setShowQuickPanel(false)}
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex border-b border-blue-400/30">
            {[
              { key: 'prompts', label: '常用提示词', icon: <Code size={16} /> },
              { key: 'optimization', label: '代码优化', icon: <Zap size={16} /> },
              { key: 'diagnostic', label: '错误诊断', icon: <AlertTriangle size={16} /> }
            ].map(tab => (
              <button 
                key={tab.key}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.key 
                    ? 'border-b-2 border-blue-400 text-blue-100 bg-blue-900/30' 
                    : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/20'
                }`}
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-6 h-64 overflow-y-auto">
            {activeTab === 'prompts' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promptTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="group p-4 bg-blue-950/40 border border-blue-400/30 rounded-xl cursor-pointer hover:bg-blue-900/50 transition-all duration-300 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => applyPromptTemplate(template)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {template.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-blue-100 group-hover:text-white transition-colors">
                          {template.title}
                        </div>
                        <div className="text-sm text-blue-300 mt-1 line-clamp-2">
                          {template.description}
                        </div>
                        <div className="text-xs text-blue-400 mt-2 font-medium">
                          {template.category} • 点击使用
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'optimization' && (
              <div className="space-y-2">
                {optimizationOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center p-4 hover:bg-blue-900/30 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-400/30"
                    onClick={option.action}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white mr-4">
                      {option.icon}
                    </div>
                    <div className="font-medium text-blue-100">{option.title}</div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'diagnostic' && (
              <div className="space-y-2">
                {diagnosticOptions.map((option) => (
                  <div 
                    key={option.id}
                    className="flex items-center p-4 hover:bg-blue-900/30 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-blue-400/30"
                    onClick={option.action}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center text-white mr-4">
                      {option.icon}
                    </div>
                    <div className="font-medium text-blue-100">{option.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 输入区域 */}
      <div className="relative z-10 border-t border-blue-400/30 bg-blue-950/40 backdrop-blur-md p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full p-4 pr-32 bg-blue-950/50 border-2 border-blue-400/30 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-lg placeholder-blue-400/60 text-blue-100 backdrop-blur-md"
              placeholder="输入你的问题或需求..."
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              <button 
                className="p-2 rounded-lg hover:bg-blue-800/30 transition-colors text-blue-300 hover:text-blue-100" 
                title="附件上传"
              >
                <Paperclip size={18} />
              </button>
              <button 
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500/80 text-white animate-pulse' 
                    : 'hover:bg-blue-800/30 text-blue-300 hover:text-blue-100'
                }`}
                onClick={toggleVoiceInput}
                title={isRecording ? "停止录音" : "语音输入"}
              >
                <Mic size={18} />
              </button>
              <button 
                className="p-2 rounded-lg hover:bg-blue-800/30 transition-colors text-blue-300 hover:text-blue-100"
                onClick={toggleQuickPanel}
                title="快捷功能"
              >
                {showQuickPanel ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-blue-300">
              {inputValue.length > 0 && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  {inputValue.length} 字符
                </span>
              )}
            </div>
            <button 
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                !inputValue.trim() 
                  ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-blue-500/25'
              }`}
              onClick={sendMessage}
              disabled={!inputValue.trim()}
            >
              <Send size={18} />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
