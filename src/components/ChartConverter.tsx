import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Code, RefreshCw, Maximize, Image, Palette, Settings, Camera, BarChart3, AlertTriangle } from 'lucide-react';
import Editor from '@monaco-editor/react';
import * as echarts from 'echarts';
import { Chart, registerables } from 'chart.js';
import * as htmlToImage from 'html-to-image';
import mermaid from 'mermaid';

// Register Chart.js components
Chart.register(...registerables);

interface ChartConverterProps {
  className?: string;
}

type ChartLibrary = 'echarts' | 'chartjs' | 'plotly' | 'd3' | 'mermaid';
type ImageFormat = 'png' | 'jpg' | 'svg';

const ChartConverter: React.FC<ChartConverterProps> = ({ className }) => {
  // State variables
  const [chartLibrary, setChartLibrary] = useState<ChartLibrary>('echarts');
  const [chartCode, setChartCode] = useState<string>('');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const currentChartInstanceRef = useRef<any>(null); // 存储当前图表实例
  const renderRequestIdRef = useRef<number>(0); // 防止竞态条件
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewScale, setPreviewScale] = useState(100);
  const [chartSize, setChartSize] = useState({ width: 800, height: 500 });
  const [exportSettings, setExportSettings] = useState({
    format: 'png' as ImageFormat,
    resolution: 4,
    backgroundColor: '#ffffff',
    transparentBg: false,
  });
  const [showExportPanel, setShowExportPanel] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mermaid initialization - 只初始化一次
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
  }, []);

  // 获取默认代码
  const getDefaultCode = useCallback((library: ChartLibrary): string => {
    switch (library) {
      case 'echarts': 
        return `// ECharts 示例
const option = {
  title: { text: 'ECharts 测试图表' },
  xAxis: { 
    type: 'category',
    data: ['一月', '二月', '三月', '四月', '五月', '六月'] 
  },
  yAxis: { type: 'value' },
  series: [{
    name: '销售量',
    type: 'bar',
    data: [120, 200, 150, 80, 70, 110]
  }]
};`;
      case 'chartjs': 
        return `// Chart.js 示例
const type = 'line';
const data = {
  labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
  datasets: [{
    label: '销售数据',
    data: [65, 59, 80, 81, 56, 55],
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    tension: 0.1
  }]
};
const options = {
  responsive: false,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'Chart.js 测试图表'
    }
  }
};`;
      case 'mermaid': 
        return `graph TD
    A[开始] --> B{是否正确?}
    B -->|是| C[继续处理]
    B -->|否| D[修复错误]
    D --> B
    C --> E[结束]`;
      default: 
        return '// 请选择图表库并输入代码';
    }
  }, []);

  // 清理当前图表实例
  const cleanupCurrentChart = useCallback(() => {
    if (currentChartInstanceRef.current) {
      try {
        if (chartLibrary === 'echarts' && currentChartInstanceRef.current.dispose) {
          currentChartInstanceRef.current.dispose();
        } else if (chartLibrary === 'chartjs' && currentChartInstanceRef.current.destroy) {
          currentChartInstanceRef.current.destroy();
        }
      } catch (error) {
        console.warn('清理图表实例时出现警告:', error);
      }
      currentChartInstanceRef.current = null;
    }
    
    if (chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
    }
  }, [chartLibrary]);

  // 渲染 ECharts
  const renderECharts = useCallback(async (requestId: number) => {
    if (!chartContainerRef.current || requestId !== renderRequestIdRef.current) return;
    
    try {
      // 创建图表容器
      const chartDiv = document.createElement('div');
      chartDiv.style.width = `${chartSize.width}px`;
      chartDiv.style.height = `${chartSize.height}px`;
      chartContainerRef.current.appendChild(chartDiv);
      
      // 初始化 ECharts 实例
      const chart = echarts.init(chartDiv);
      currentChartInstanceRef.current = chart;
      
      // 执行用户代码
      const executeCode = new Function('echarts', `
        ${chartCode}
        if (typeof option !== 'undefined') {
          return option;
        } else {
          throw new Error('请在代码中定义 option 变量');
        }
      `);
      
      const option = executeCode(echarts);
      chart.setOption(option);
      
      // 添加窗口大小调整监听器
      const resizeHandler = () => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
      };
      window.addEventListener('resize', resizeHandler);
      
      // 清理函数
      return () => {
        window.removeEventListener('resize', resizeHandler);
        if (chart && !chart.isDisposed()) {
          chart.dispose();
        }
      };
    } catch (error) {
      console.error('ECharts 渲染错误:', error);
      throw new Error(`ECharts 渲染失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [chartCode, chartSize.width, chartSize.height]);

  // 渲染 Chart.js
  const renderChartJS = useCallback(async (requestId: number) => {
    if (!chartContainerRef.current || requestId !== renderRequestIdRef.current) return;
    
    try {
      // 创建 canvas 元素
      const canvas = document.createElement('canvas');
      canvas.width = chartSize.width;
      canvas.height = chartSize.height;
      chartContainerRef.current.appendChild(canvas);
      
      // 执行用户代码
      const executeCode = new Function('Chart', `
        ${chartCode}
        if (typeof type !== 'undefined' && typeof data !== 'undefined') {
          return { 
            type, 
            data, 
            options: typeof options !== 'undefined' ? options : {} 
          };
        } else {
          throw new Error('请在代码中定义 type 和 data 变量');
        }
      `);
      
      const { type, data, options } = executeCode(Chart);
      
      // 创建 Chart.js 实例
      const chart = new Chart(canvas, {
        type,
        data,
        options: {
          ...options,
          responsive: false,
          maintainAspectRatio: false
        }
      });
      
      currentChartInstanceRef.current = chart;
      
      return () => {
        if (chart) {
          chart.destroy();
        }
      };
    } catch (error) {
      console.error('Chart.js 渲染错误:', error);
      throw new Error(`Chart.js 渲染失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [chartCode, chartSize.width, chartSize.height]);

  // 渲染 Mermaid
  const renderMermaid = useCallback(async (requestId: number) => {
    if (!chartContainerRef.current || requestId !== renderRequestIdRef.current) return;
    
    try {
      const uniqueId = `mermaid-chart-${Date.now()}`;
      const mermaidDiv = document.createElement('div');
      mermaidDiv.id = uniqueId;
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = chartCode;
      chartContainerRef.current.appendChild(mermaidDiv);
      
      // 渲染 Mermaid 图表
      await mermaid.run({ nodes: [mermaidDiv] });
      
      // 调整 SVG 尺寸
      const svgElement = chartContainerRef.current.querySelector(`#${uniqueId} svg`);
      if (svgElement) {
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
      }
      
      return () => {
        // Mermaid 不需要特殊清理
      };
    } catch (error) {
      console.error('Mermaid 渲染错误:', error);
      throw new Error(`Mermaid 渲染失败: ${error instanceof Error ? error.message : '语法错误'}`);
    }
  }, [chartCode]);

  // 主渲染函数
  const renderChart = useCallback(async () => {
    const requestId = ++renderRequestIdRef.current;
    
    if (!chartContainerRef.current) return;
    
    // 清理之前的图表
    cleanupCurrentChart();
    setRenderError(null);
    setIsRendering(true);
    
    try {
      // 检查代码是否为空
      if (!chartCode.trim()) {
        const message = chartLibrary === 'mermaid' 
          ? '请输入 Mermaid 语法以生成图表'
          : chartLibrary === 'plotly' || chartLibrary === 'd3'
          ? `${chartLibrary === 'plotly' ? 'Plotly.js' : 'D3.js'} 图表渲染将在后续版本中支持`
          : '请在左侧编辑器输入代码以生成图表';
          
        chartContainerRef.current.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8 text-center tech-card-no-hover" style="background: rgba(0,0,0,0.1); border-radius: 0.75rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info mb-4 opacity-50">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p class="text-lg font-medium mb-2">图表预览区</p>
            <p class="text-sm">${message}</p>
            <p class="text-xs mt-4 opacity-70">当前支持: ECharts, Chart.js, Mermaid</p>
          </div>
        `;
        return;
      }
      
      // 根据图表库类型渲染
      let cleanup: (() => void) | undefined;
      
      switch (chartLibrary) {
        case 'echarts':
          cleanup = await renderECharts(requestId);
          break;
        case 'chartjs':
          cleanup = await renderChartJS(requestId);
          break;
        case 'mermaid':
          cleanup = await renderMermaid(requestId);
          break;
        case 'plotly':
        case 'd3':
          chartContainerRef.current.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-blue-500 dark:text-blue-400 p-8 text-center tech-card-no-hover" style="background: rgba(30,144,255,0.1); border-radius: 0.75rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-construction mb-4 opacity-70">
                <rect x="2" y="6" width="20" height="8" rx="1"/>
                <path d="m17 14-3-3 3-3"/>
                <path d="m7 14 3-3-3-3"/>
              </svg>
              <p class="text-lg font-medium mb-2">${chartLibrary === 'plotly' ? 'Plotly.js' : 'D3.js'} 支持</p>
              <p class="text-sm">此功能正在开发中，敬请期待...</p>
            </div>
          `;
          break;
        default:
          throw new Error(`不支持的图表库: ${chartLibrary}`);
      }
      
      // 保存清理函数
      if (cleanup) {
        currentChartInstanceRef.current = {
          ...currentChartInstanceRef.current,
          cleanup
        };
      }
      
    } catch (error) {
      console.error('图表渲染错误:', error);
      setRenderError(error instanceof Error ? error.message : '未知渲染错误');
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }
    } finally {
      if (requestId === renderRequestIdRef.current) {
        setIsRendering(false);
      }
    }
  }, [chartLibrary, chartCode, renderECharts, renderChartJS, renderMermaid, cleanupCurrentChart]);

  // 图表库切换时更新代码
  useEffect(() => {
    setChartCode(getDefaultCode(chartLibrary));
  }, [chartLibrary, getDefaultCode]);

  // 代码改变时重新渲染
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      renderChart();
    }, 300); // 防抖，避免频繁渲染
    
    return () => clearTimeout(timeoutId);
  }, [chartCode, chartSize, renderChart]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanupCurrentChart();
    };
  }, [cleanupCurrentChart]);

  // 保存超高清图片
  const saveUltraHighResImage = async () => {
    if (!chartContainerRef.current) return;
    
    try {
      setIsCapturing(true);
      
      const originalBg = chartContainerRef.current.style.backgroundColor;
      if (!exportSettings.transparentBg) {
        chartContainerRef.current.style.backgroundColor = exportSettings.backgroundColor;
      }
      
      const options: any = {
        pixelRatio: 4,
        width: chartSize.width * 2,
        height: chartSize.height * 2,
        backgroundColor: exportSettings.transparentBg ? null : exportSettings.backgroundColor,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: `${chartSize.width}px`,
          height: `${chartSize.height}px`
        }
      };
      
      const dataUrl = await htmlToImage.toPng(chartContainerRef.current, options);
      chartContainerRef.current.style.backgroundColor = originalBg;
      
      const link = document.createElement('a');
      link.download = `chart-ultra-hd-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('保存超高清图片失败:', error);
      alert('保存超高清图片失败，请重试');
    } finally {
      setIsCapturing(false);
    }
  };

  // 导出图表
  const exportChart = async () => {
    if (!chartContainerRef.current) return;
    
    try {
      setIsCapturing(true);
      
      const originalBg = chartContainerRef.current.style.backgroundColor;
      if (!exportSettings.transparentBg) {
        chartContainerRef.current.style.backgroundColor = exportSettings.backgroundColor;
      }
      
      const options: any = {
        pixelRatio: exportSettings.resolution,
        backgroundColor: exportSettings.transparentBg ? null : exportSettings.backgroundColor,
      };
      
      let dataUrl: string;
      switch (exportSettings.format) {
        case 'jpg':
          dataUrl = await htmlToImage.toJpeg(chartContainerRef.current, options);
          break;
        case 'svg':
          dataUrl = await htmlToImage.toSvg(chartContainerRef.current, options);
          break;
        default:
          dataUrl = await htmlToImage.toPng(chartContainerRef.current, options);
          break;
      }
      
      chartContainerRef.current.style.backgroundColor = originalBg;
      
      const link = document.createElement('a');
      link.download = `chart-export-${Date.now()}.${exportSettings.format}`;
      link.href = dataUrl;
      link.click();
      
    } catch (error) {
      console.error('导出图表出错:', error);
      setRenderError(error instanceof Error ? error.message : '导出失败');
    } finally {
      setIsCapturing(false);
    }
  };

  // 其他工具函数
  const formatCode = () => {
    try {
      const formatted = chartCode
        .replace(/{\s*/g, '{\n  ')
        .replace(/,\s*/g, ',\n  ')
        .replace(/}\s*/g, '\n}')
        .replace(/\[\s*/g, '[\n  ')
        .replace(/\]\s*/g, '\n]')
        .replace(/\n\s*\n/g, '\n')
        .trim();
      setChartCode(formatted);
    } catch (e) {
      console.error("格式化错误", e);
    }
  };

  const refreshPreview = () => {
    renderChart();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 组件 JSX
  return (
    <div className={`flex flex-1 h-full ${className} relative`}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-blue-900/30"></div>
      
      {/* Code Editor Section */}
      <div className={`relative z-10 flex flex-col ${isFullscreen ? 'hidden' : 'w-1/2 h-full'} border-r border-blue-400/30`}>
        <div className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <select
                className="mr-3 p-2 text-sm rounded-lg border border-blue-400/30 bg-blue-950/50 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-md"
                value={chartLibrary}
                onChange={(e) => setChartLibrary(e.target.value as ChartLibrary)}
              >
                <option value="echarts">ECharts</option>
                <option value="chartjs">Chart.js</option>
                <option value="mermaid">Mermaid</option>
                <option value="plotly">Plotly.js (开发中)</option>
                <option value="d3">D3.js (开发中)</option>
              </select>
              <span className="text-sm font-medium text-blue-100 flex items-center">
                <Code className="mr-2 text-blue-400" size={16} />
                图表代码编辑器
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                className="btn-icon" 
                onClick={formatCode} 
                title="格式化代码"
              >
                <Code size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden bg-blue-950/20 backdrop-blur-sm min-h-0">
          <Editor
            height="100%"
            defaultLanguage={chartLibrary === 'mermaid' ? 'markdown' : 'javascript'}
            key={chartLibrary} // 强制重新渲染编辑器
            value={chartCode}
            onChange={(value) => setChartCode(value || '')}
            theme="vs-dark"
            options={{ 
              minimap: { enabled: false }, 
              fontSize: 14, 
              wordWrap: 'on', 
              lineNumbers: 'on', 
              folding: true, 
              tabSize: 2 
            }}
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className={`relative z-10 flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-1/2 h-full'}`}>
        <div className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-100 flex items-center">
                <BarChart3 className="mr-2 text-blue-400" size={16} />
                图表预览
              </span>
              <span className="ml-3 text-xs text-blue-300 bg-blue-950/50 px-2 py-1 rounded">
                {chartSize.width} × {chartSize.height}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-blue-950/50 rounded-lg px-3 py-1 border border-blue-400/30">
                <span className="text-xs mr-2 text-blue-300">缩放:</span>
                <input 
                  type="range" 
                  min="50" 
                  max="200" 
                  step="10" 
                  value={previewScale} 
                  onChange={(e) => setPreviewScale(parseInt(e.target.value))} 
                  className="w-20 accent-blue-500" 
                />
                <span className="text-xs ml-2 text-blue-100 font-medium">{previewScale}%</span>
              </div>
              <button 
                className={`btn-icon ${isCapturing ? 'animate-pulse bg-blue-600/50 text-blue-100' : ''}`} 
                onClick={saveUltraHighResImage} 
                disabled={isCapturing} 
                title="保存超高清图片 (Ultra HD)"
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
        
        <div className="flex-1 bg-blue-950/10 backdrop-blur-sm flex flex-col">
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {/* 渲染错误显示 */}
            {renderError && (
              <div className="p-6 bg-red-950/50 text-red-300 rounded-xl border border-red-500/30 backdrop-blur-md max-w-md tech-card-no-hover">
                <p className="font-medium flex items-center">
                  <AlertTriangle className="mr-2" size={20} />
                  渲染错误
                </p>
                <pre className="text-sm mt-3 whitespace-pre-wrap opacity-90">{renderError}</pre>
              </div>
            )}
            
            {/* 加载状态显示 */}
            {!renderError && isRendering && (
              <div 
                style={{ width: `${chartSize.width}px`, height: `${chartSize.height}px` }} 
                className="bg-transparent rounded-xl relative flex items-center justify-center"
              >
                <div className="flex items-center space-x-3 text-blue-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                  <span className="text-sm font-medium">渲染中...</span>
                </div>
              </div>
            )}
            
            {/* 图表容器 */}
            <div
              ref={chartContainerRef}
              style={{
                width: !isRendering && !renderError ? `${chartSize.width}px` : 'auto',
                height: !isRendering && !renderError ? `${chartSize.height}px` : 'auto',
                transform: `scale(${previewScale / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out',
                display: isRendering && !renderError ? 'none' : 'block'
              }}
              className={`${(!renderError && chartCode.trim()) ? 'bg-white shadow-xl border border-blue-400/20' : ''} rounded-xl relative overflow-hidden`}
            >
              {/* 图表内容通过 renderChart 函数注入 */}
            </div>
          </div>
          
          {/* 导出面板 */}
          {showExportPanel && (
            <div className="border-t border-blue-400/30">
              <div className="tech-card-no-hover border-b border-blue-400/30 backdrop-blur-md">
                <div className="flex justify-between items-center px-4 py-3">
                  <span className="font-medium text-sm text-blue-100 flex items-center">
                    <Camera className="mr-2 text-blue-400" size={16} />
                    导出设置
                  </span>
                  <button 
                    className="btn-icon" 
                    onClick={() => setShowExportPanel(!showExportPanel)}
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-950/30 backdrop-blur-md p-4 grid grid-cols-2 gap-4">
                {/* 左侧设置 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-blue-200">格式</label>
                    <div className="flex space-x-2">
                      {['png', 'jpg', 'svg'].map(format => (
                        <button
                          key={format}
                          className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
                            exportSettings.format === format
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-blue-950/50 text-blue-200 hover:bg-blue-900/50 border border-blue-400/30'
                          }`}
                          onClick={() => setExportSettings({...exportSettings, format: format as ImageFormat})}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-2 text-blue-200">背景色</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={exportSettings.backgroundColor}
                        onChange={(e) => setExportSettings({...exportSettings, backgroundColor: e.target.value})}
                        className="w-10 h-10 rounded-lg border border-blue-400/30 bg-blue-950/50"
                        disabled={exportSettings.transparentBg}
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="transparentBg"
                          checked={exportSettings.transparentBg}
                          onChange={(e) => setExportSettings({...exportSettings, transparentBg: e.target.checked})}
                          className="mr-2 accent-blue-500"
                        />
                        <label htmlFor="transparentBg" className="text-xs text-blue-200">
                          透明背景
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 右侧设置 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-2 text-blue-200">
                      分辨率 <span className="text-blue-400 ml-1">(超高清: 4x)</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={exportSettings.resolution}
                        onChange={(e) => setExportSettings({...exportSettings, resolution: parseInt(e.target.value)})}
                        className="flex-1 mr-3 accent-blue-500"
                      />
                      <span className="text-xs font-medium text-blue-100 bg-blue-950/50 px-2 py-1 rounded">
                        {exportSettings.resolution}x
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-2 text-blue-200">尺寸</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={chartSize.width}
                        onChange={(e) => setChartSize({...chartSize, width: parseInt(e.target.value) || 800})}
                        className="w-20 p-2 text-xs rounded-lg border border-blue-400/30 bg-blue-950/50 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <span className="text-blue-300">×</span>
                      <input
                        type="number"
                        value={chartSize.height}
                        onChange={(e) => setChartSize({...chartSize, height: parseInt(e.target.value) || 500})}
                        className="w-20 p-2 text-xs rounded-lg border border-blue-400/30 bg-blue-950/50 text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button className="btn-icon">
                        <Palette size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-950/40 backdrop-blur-md p-4 flex justify-between">
                <button
                  className={`btn btn-secondary ${isCapturing ? 'animate-pulse' : ''}`}
                  onClick={saveUltraHighResImage}
                  disabled={isCapturing || isRendering || !!renderError}
                >
                  <Camera size={16} className="mr-2" />
                  {isCapturing ? '保存中...' : '超高清保存'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={exportChart}
                  disabled={isCapturing || isRendering || !!renderError}
                >
                  <Image size={16} className="mr-2" />
                  标准导出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartConverter;
