import React, { useState, useEffect, useRef } from 'react';
import { Download, Code, RefreshCw, Maximize, Smartphone, Tablet, Monitor, Camera } from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as htmlToImage from 'html-to-image';

interface HTMLPreviewerProps {
  className?: string;
}

type ViewportType = 'desktop' | 'tablet' | 'mobile';

const HTMLPreviewer: React.FC<HTMLPreviewerProps> = ({ className }) => {
  const [htmlCode, setHtmlCode] = useState<string>(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML预览</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #2563eb;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      background: linear-gradient(45deg, #2563eb, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    p {
      font-size: 1.1em;
      margin-bottom: 20px;
      color: #555;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .feature-card {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      padding: 20px;
      border-radius: 15px;
      color: white;
      text-align: center;
      transform: translateY(0);
      transition: transform 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-5px);
    }
    button {
      background: linear-gradient(45deg, #2563eb, #7c3aed);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-size: 1em;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
    }
    .stats {
      display: flex;
      justify-content: space-around;
      margin: 30px 0;
    }
    .stat-item {
      text-align: center;
    }
    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #2563eb;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 HTML实时预览器</h1>
    <p>这是一个功能强大的HTML实时预览示例。您可以在左侧编辑器中修改HTML代码，右侧将实时显示渲染结果。</p>
    
    <div class="feature-grid">
      <div class="feature-card">
        <h3>📝 实时编辑</h3>
        <p>支持HTML、CSS和JavaScript的实时预览</p>
      </div>
      <div class="feature-card">
        <h3>📱 响应式设计</h3>
        <p>支持桌面、平板、手机视图切换</p>
      </div>
      <div class="feature-card">
        <h3>🎨 现代UI</h3>
        <p>美观的界面设计和流畅的动画效果</p>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <div class="stat-number">100+</div>
        <div class="stat-label">HTML标签支持</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">50+</div>
        <div class="stat-label">CSS属性</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">∞</div>
        <div class="stat-label">创意可能</div>
      </div>
    </div>
    
    <div style="text-align: center;">
      <button id="demo-button">🎉 点击体验</button>
    </div>
  </div>
  <script>
    document.getElementById('demo-button').addEventListener('click', function() {
      this.innerHTML = '✨ 太棒了！';
      this.style.background = 'linear-gradient(45deg, #10b981, #059669)';
      setTimeout(() => {
        this.innerHTML = '🎉 点击体验';
        this.style.background = 'linear-gradient(45deg, #2563eb, #7c3aed)';
      }, 2000);
    });
  </script>
</body>
</html>`);
  
  const [viewportType, setViewportType] = useState<ViewportType>('desktop');
  const previewRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // 更新预览
  useEffect(() => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlCode);
        iframeDoc.close();
      }
    }
  }, [htmlCode]);
  
  // 格式化HTML代码
  const formatCode = () => {
    // 简单的HTML格式化逻辑，实际项目中可以使用专业库
    try {
      const formatted = htmlCode
        .replace(/></g, '>\n<')
        .replace(/\n\s*\n/g, '\n')
        .replace(/^\s*|\s*$/g, '');
      
      setHtmlCode(formatted);
    } catch (error) {
      console.error('格式化代码出错:', error);
    }
  };
  
  // 刷新预览
  const refreshPreview = () => {
    if (previewRef.current) {
      const iframe = previewRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlCode);
        iframeDoc.close();
      }
    }
  };
  
  // 导出HTML文件
  const exportHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 保存超高清图片
  const saveHighResImage = async () => {
    if (!previewRef.current) return;
    
    try {
      setIsCapturing(true);
      
      const iframe = previewRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc || !iframeDoc.body) {
        throw new Error('无法访问预览内容');
      }
      
      // 先尝试简单的截图方案
      try {
        await saveSimpleScreenshot();
      } catch (simpleError) {
        console.warn('简单截图失败，尝试高级方案:', simpleError);
        await saveAdvancedScreenshot();
      }
      
    } catch (error) {
      console.error('保存图片失败:', error);
      alert('保存图片失败，请重试或检查浏览器权限');
    } finally {
      setIsCapturing(false);
    }
  };
  
  // 简单截图方案 - 直接截取iframe容器
  const saveSimpleScreenshot = async () => {
    if (!previewRef.current) return;
    
    const iframe = previewRef.current;
    
    // 等待内容加载
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 直接截取iframe容器
    const dataUrl = await htmlToImage.toPng(iframe, {
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });
    
    // 下载图片
    const link = document.createElement('a');
    link.download = `html-preview-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };
  
  // 高级截图方案 - 截取iframe内部内容
  const saveAdvancedScreenshot = async () => {
    if (!previewRef.current) return;
    
    const iframe = previewRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc || !iframeDoc.body) {
      throw new Error('无法访问预览内容');
    }
    
    // 等待iframe内容完全加载
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 直接截取iframe的body内容
    const bodyElement = iframeDoc.body;
    
    // 确保所有样式和图片都已加载
    const images = iframeDoc.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = img.onerror = resolve;
      });
    });
    
    await Promise.all(imagePromises);
    
    // 设置截图选项
    const options = {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: iframe.clientWidth,
      height: iframe.clientHeight,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    };
    
    // 直接截取iframe body
    const dataUrl = await htmlToImage.toPng(bodyElement, options);
    
    // 下载图片
    const link = document.createElement('a');
    link.download = `html-preview-hd-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };
  
  // 切换全屏预览
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // 获取预览容器类名
  const getPreviewContainerClass = () => {
    switch (viewportType) {
      case 'mobile':
        return 'w-[375px] h-[667px] mx-auto border-2 border-blue-400/30 rounded-lg overflow-hidden';
      case 'tablet':
        return 'w-[768px] h-[1024px] mx-auto border-2 border-blue-400/30 rounded-lg overflow-hidden';
      default:
        return 'w-full h-full';
    }
  };
  
  return (
    <div className={`flex flex-1 h-full ${className} relative`}>
      {/* 科技风格背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-blue-900/30"></div>
      
      {/* 代码编辑器区域 */}
      <div className={`relative z-10 flex flex-col ${isFullscreen ? 'hidden' : 'w-1/2 h-full'} border-r border-blue-400/30`}>
        <div className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-blue-100 flex items-center">
              <Code className="mr-2 text-blue-400" size={16} />
              HTML编辑器
            </span>
            <div className="flex space-x-2">
              <button 
                className="btn-icon" 
                onClick={formatCode}
                title="格式化代码"
              >
                <Code size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={exportHTML}
                title="导出HTML"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-blue-950/20 backdrop-blur-sm min-h-0">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={htmlCode}
            onChange={(value) => setHtmlCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              lineNumbers: 'on',
              folding: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
      
      {/* 预览区域 */}
      <div className={`relative z-10 flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-1/2 h-full'}`}>
        <div className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-blue-100 flex items-center">
              <Monitor className="mr-2 text-blue-400" size={16} />
              预览
            </span>
            <div className="flex space-x-2">
              <div className="flex bg-blue-950/50 rounded-lg overflow-hidden border border-blue-400/30">
                <button 
                  className={`p-2 transition-all duration-200 ${
                    viewportType === 'desktop' 
                      ? 'bg-blue-600/50 text-blue-100' 
                      : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30'
                  }`}
                  onClick={() => setViewportType('desktop')}
                  title="桌面视图"
                >
                  <Monitor size={16} />
                </button>
                <button 
                  className={`p-2 transition-all duration-200 ${
                    viewportType === 'tablet' 
                      ? 'bg-blue-600/50 text-blue-100' 
                      : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30'
                  }`}
                  onClick={() => setViewportType('tablet')}
                  title="平板视图"
                >
                  <Tablet size={16} />
                </button>
                <button 
                  className={`p-2 transition-all duration-200 ${
                    viewportType === 'mobile' 
                      ? 'bg-blue-600/50 text-blue-100' 
                      : 'text-blue-300 hover:text-blue-100 hover:bg-blue-800/30'
                  }`}
                  onClick={() => setViewportType('mobile')}
                  title="手机视图"
                >
                  <Smartphone size={16} />
                </button>
              </div>
              <button 
                className={`btn-icon ${isCapturing ? 'animate-pulse bg-blue-600/50 text-blue-100' : ''}`}
                onClick={saveHighResImage}
                disabled={isCapturing}
                title="保存超高清图片 (4K)"
              >
                <Camera size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={refreshPreview}
                title="刷新预览"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                className="btn-icon" 
                onClick={toggleFullscreen}
                title={isFullscreen ? "退出全屏" : "全屏预览"}
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-blue-950/10 backdrop-blur-sm p-4 min-h-0 overflow-auto">
          <div className={getPreviewContainerClass()}>
            <iframe
              ref={previewRef}
              title="HTML Preview"
              className="w-full h-full border-0 rounded-lg shadow-lg"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HTMLPreviewer;
