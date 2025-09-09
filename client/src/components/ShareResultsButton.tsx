import { useState } from 'react';
import { generateShareableLink, copyToClipboard } from '@/lib/userPreferences';
import { useToast } from '@/hooks/use-toast';

interface ShareResultsButtonProps {
  toolId: string;
  results: Record<string, any>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShareResultsButton = ({ 
  toolId, 
  results, 
  className = '', 
  size = 'md' 
}: ShareResultsButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const shareableLink = generateShareableLink(toolId, results);
      
      // Try to use native Web Share API first (mobile/modern browsers)
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: 'Calculation Results - CalcEasy',
          text: 'Check out my calculation results',
          url: shareableLink,
        });
      } else {
        // Fallback to clipboard
        const success = await copyToClipboard(shareableLink);
        
        if (success) {
          toast({
            title: "Link copied!",
            description: "The shareable link has been copied to your clipboard.",
          });
        } else {
          throw new Error('Failed to copy to clipboard');
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share failed",
        description: "Unable to share results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`
        ${sizeClasses[size]}
        bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg 
        transition-colors duration-200 flex items-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      data-testid="button-share-results"
      title="Share calculation results"
    >
      <i className={`fas ${isSharing ? 'fa-spinner fa-spin' : 'fa-share-alt'}`}></i>
      <span>{isSharing ? 'Sharing...' : 'Share Results'}</span>
    </button>
  );
};

export default ShareResultsButton;