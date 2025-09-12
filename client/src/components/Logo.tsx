import { Link } from 'wouter';
import logoImage from '@assets/logo.png';

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
    <img 
      src={logoImage}
      alt="DapsiWow Logo"
      className={`${sizeClasses[size]} object-contain filter drop-shadow-sm transition-transform hover:scale-105`}
    />
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