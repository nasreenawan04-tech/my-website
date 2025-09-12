import { Link } from 'wouter';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onClick?: () => void;
}

const Logo = ({ className = '', size = 'md', showText = true, onClick }: LogoProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm`}>
      <svg
        viewBox="0 0 24 24"
        className="w-1/2 h-1/2 text-white"
        fill="currentColor"
      >
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
      </svg>
    </div>
  );

  const content = (
    <div className={`flex items-center space-x-2 ${className}`} onClick={onClick}>
      <LogoIcon />
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-neutral-800 dark:text-neutral-100`}>
          DapsiWow
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button className="flex items-center" data-testid="logo-button">
        {content}
      </button>
    );
  }

  return (
    <Link href="/" className="flex items-center" data-testid="logo-link">
      {content}
    </Link>
  );
};

export default Logo;