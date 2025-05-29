import { useState, useEffect } from 'react';

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// 通知上下文接口
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

// 创建通知上下文
export const useNotifications = (): NotificationContextType => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 添加通知
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // 自动移除通知
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  // 移除通知
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};

// 通知组件
export const NotificationContainer: React.FC<{ notifications: Notification[], onRemove: (id: string) => void }> = ({ 
  notifications, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-md shadow-medium flex items-start animate-slide-in
            ${notification.type === 'success' ? 'bg-app-success bg-opacity-10 border-l-4 border-app-success' : ''}
            ${notification.type === 'error' ? 'bg-app-error bg-opacity-10 border-l-4 border-app-error' : ''}
            ${notification.type === 'warning' ? 'bg-app-warning bg-opacity-10 border-l-4 border-app-warning' : ''}
            ${notification.type === 'info' ? 'bg-app-info bg-opacity-10 border-l-4 border-app-info' : ''}
          `}
        >
          <div className="flex-1">
            <p className={`
              text-sm font-medium
              ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' : ''}
              ${notification.type === 'error' ? 'text-red-800 dark:text-red-200' : ''}
              ${notification.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : ''}
              ${notification.type === 'info' ? 'text-blue-800 dark:text-blue-200' : ''}
            `}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

// 加载指示器组件
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg', className?: string }> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent animate-spin ${className}`}></div>
  );
};

// 模态对话框组件
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  // 处理ESC键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // 阻止点击内容区域时关闭
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 如果不是打开状态，不渲染
  if (!isOpen) return null;

  // 尺寸类
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div 
        className={`bg-white dark:bg-dark-card rounded-lg shadow-heavy z-10 w-full ${sizeClasses[size]} animate-scale-in`}
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between p-4 border-b border-app-gray-border dark:border-dark-border">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-app-gray-text dark:text-dark-text-secondary hover:text-app-gray-dark dark:hover:text-dark-text"
          >
            <span className="sr-only">关闭</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-app-gray-border dark:border-dark-border bg-app-gray-light dark:bg-dark-bg flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// 工具提示组件
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  // 计算位置
  useEffect(() => {
    if (isVisible && childRef.current && tooltipRef.current) {
      const childRect = childRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      
      switch (position) {
        case 'top':
          x = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          y = childRect.top - tooltipRect.height - 8;
          break;
        case 'bottom':
          x = childRect.left + (childRect.width / 2) - (tooltipRect.width / 2);
          y = childRect.bottom + 8;
          break;
        case 'left':
          x = childRect.left - tooltipRect.width - 8;
          y = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          break;
        case 'right':
          x = childRect.right + 8;
          y = childRect.top + (childRect.height / 2) - (tooltipRect.height / 2);
          break;
      }
      
      // 确保不超出视口
      x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
      y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));
      
      setCoords({ x, y });
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={childRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-900 rounded shadow-light pointer-events-none animate-fade-in"
          style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-800 dark:bg-gray-900 transform rotate-45 ${
              position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
              position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
              position === 'left' ? 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2' :
              'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
          ></div>
        </div>
      )}
    </>
  );
};

// 按钮组件
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // 变体类
  const variantClasses = {
    primary: 'bg-brand-blue hover:bg-brand-blue-hover active:bg-brand-blue-pressed text-white',
    secondary: 'bg-white dark:bg-dark-card border border-app-gray-border dark:border-dark-border text-app-gray-dark dark:text-dark-text hover:bg-app-gray-light dark:hover:bg-dark-bg',
    text: 'bg-transparent text-brand-blue dark:text-brand-blue-dark hover:bg-app-gray-light dark:hover:bg-dark-bg',
    danger: 'bg-app-error hover:bg-red-600 active:bg-red-700 text-white',
  };

  // 尺寸类
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 h-8',
    md: 'text-sm px-4 py-2 h-10',
    lg: 'text-base px-6 py-3 h-12',
  };

  return (
    <button
      className={`
        rounded-md font-medium flex items-center justify-center transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// 输入框组件
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-app-gray-dark dark:text-dark-text">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-app-gray-text dark:text-dark-text-secondary">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2 bg-white dark:bg-dark-card border border-app-gray-border dark:border-dark-border rounded-md
            focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-blue-dark focus:border-transparent
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-app-error focus:ring-app-error' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-app-error">{error}</p>
      )}
    </div>
  );
};

// 下拉选择框组件
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-app-gray-dark dark:text-dark-text">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 bg-white dark:bg-dark-card border border-app-gray-border dark:border-dark-border rounded-md
          focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-blue-dark focus:border-transparent
          ${error ? 'border-app-error focus:ring-app-error' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-app-error">{error}</p>
      )}
    </div>
  );
};

// 复选框组件
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        className="w-4 h-4 text-brand-blue dark:text-brand-blue-dark bg-white dark:bg-dark-card border border-app-gray-border dark:border-dark-border rounded focus:ring-brand-blue dark:focus:ring-brand-blue-dark"
        {...props}
      />
      <span className="ml-2 text-sm text-app-gray-dark dark:text-dark-text">{label}</span>
    </label>
  );
};

// 单选按钮组件
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export const Radio: React.FC<RadioProps> = ({
  label,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center ${className}`}>
      <input
        type="radio"
        className="w-4 h-4 text-brand-blue dark:text-brand-blue-dark bg-white dark:bg-dark-card border border-app-gray-border dark:border-dark-border focus:ring-brand-blue dark:focus:ring-brand-blue-dark"
        {...props}
      />
      <span className="ml-2 text-sm text-app-gray-dark dark:text-dark-text">{label}</span>
    </label>
  );
};

// 开关组件
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center ${className}`}>
      <div className="relative inline-block w-10 mr-2 align-middle select-none">
        <input
          type="checkbox"
          checked={checked}
          className="sr-only"
          {...props}
        />
        <div className={`
          block h-6 rounded-full transition-colors duration-200 ease-in-out
          ${checked ? 'bg-brand-blue dark:bg-brand-blue-dark' : 'bg-app-gray-border dark:bg-dark-border'}
        `}></div>
        <div className={`
          absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
          ${checked ? 'transform translate-x-4' : ''}
        `}></div>
      </div>
      {label && (
        <span className="text-sm text-app-gray-dark dark:text-dark-text">{label}</span>
      )}
    </label>
  );
};

// 标签页组件
export interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-app-gray-border dark:border-dark-border ${className}`}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`
              px-4 py-2 text-sm font-medium transition-colors duration-200
              ${activeTab === tab.id
                ? 'text-brand-blue dark:text-brand-blue-dark border-b-2 border-brand-blue dark:border-brand-blue-dark'
                : 'text-app-gray-text dark:text-dark-text-secondary hover:text-app-gray-dark dark:hover:text-dark-text'
              }
            `}
            onClick={() => onChange(tab.id)}
          >
            <div className="flex items-center">
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// 卡片组件
export interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  actions,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-light border border-app-gray-border dark:border-dark-border ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-app-gray-border dark:border-dark-border flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

// 徽章组件
export interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-brand-blue bg-opacity-10 text-brand-blue dark:bg-opacity-20 dark:text-brand-blue-dark',
    success: 'bg-app-success bg-opacity-10 text-app-success dark:bg-opacity-20',
    warning: 'bg-app-warning bg-opacity-10 text-app-warning dark:bg-opacity-20',
    error: 'bg-app-error bg-opacity-10 text-app-error dark:bg-opacity-20',
    info: 'bg-app-info bg-opacity-10 text-app-info dark:bg-opacity-20',
    default: 'bg-app-gray-border bg-opacity-20 text-app-gray-text dark:bg-dark-border dark:text-dark-text-secondary',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// 分割线组件
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  return orientation === 'horizontal' ? (
    <hr className={`border-app-gray-border dark:border-dark-border my-4 ${className}`} />
  ) : (
    <div className={`border-l border-app-gray-border dark:border-dark-border mx-4 ${className}`}></div>
  );
};

// 空状态组件
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon && <div className="text-app-gray-text dark:text-dark-text-secondary mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-app-gray-dark dark:text-dark-text mb-2">{title}</h3>
      {description && <p className="text-sm text-app-gray-text dark:text-dark-text-secondary mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
