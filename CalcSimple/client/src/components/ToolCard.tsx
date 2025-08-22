import { useLocation } from 'wouter';
import { type Tool, categories } from '@/data/tools';

interface ToolCardProps {
  tool: Tool;
  onClick?: () => void;
}

const categoryColors = {
  finance: 'bg-blue-100 text-blue-600',
  pdf: 'bg-red-100 text-red-600',
  image: 'bg-green-100 text-green-600',
  text: 'bg-yellow-100 text-yellow-600',
  seo: 'bg-purple-100 text-purple-600',
  health: 'bg-pink-100 text-pink-600'
};

const iconColors = {
  finance: 'from-blue-500 to-purple-600',
  pdf: 'from-red-500 to-pink-600',
  image: 'from-green-500 to-teal-600',
  text: 'from-yellow-500 to-orange-600',
  seo: 'from-purple-500 to-indigo-600',
  health: 'from-pink-500 to-rose-600'
};

const ToolCard = ({ tool, onClick }: ToolCardProps) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    const targetPath = tool.href || `/tools/${tool.id}`;
    setLocation(targetPath);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-neutral-100 cursor-pointer"
      onClick={handleClick}
      data-testid={`card-tool-${tool.id}`}
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${iconColors[tool.category]} rounded-lg flex items-center justify-center mb-4`}>
        <i className={`${tool.icon} text-white text-xl`}></i>
      </div>
      <h3 className="text-xl font-semibold text-neutral-800 mb-3" data-testid={`text-tool-name-${tool.id}`}>
        {tool.name}
      </h3>
      <p className="text-neutral-600 mb-4" data-testid={`text-tool-description-${tool.id}`}>
        {tool.description}
      </p>
      <span 
        className={`inline-block px-3 py-1 ${categoryColors[tool.category]} text-sm rounded-full font-medium`}
        data-testid={`text-tool-category-${tool.id}`}
      >
        {categories[tool.category]}
      </span>
    </div>
  );
};

export default ToolCard;