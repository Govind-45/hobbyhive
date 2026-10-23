import React from 'react';
import {
  BookOpen,
  Gamepad2,
  Music,
  Camera,
  Dumbbell,
  UtensilsCrossed,
  Palette,
  Sprout,
  Code2,
  Hammer,
  Folder,
  Layers,
  Sparkles,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  if (!name) return <Folder {...props} />;

  const key = name.toLowerCase();

  switch (key) {
    case 'bookopen':
    case 'book':
    case 'books':
      return <BookOpen {...props} />;
    case 'gamepad2':
    case 'gamepad':
    case 'gaming':
      return <Gamepad2 {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'camera':
    case 'photography':
      return <Camera {...props} />;
    case 'dumbbell':
    case 'fitness':
      return <Dumbbell {...props} />;
    case 'utensilscrossed':
    case 'cooking':
    case 'food':
      return <UtensilsCrossed {...props} />;
    case 'palette':
    case 'art':
      return <Palette {...props} />;
    case 'sprout':
    case 'gardening':
    case 'plants':
      return <Sprout {...props} />;
    case 'code2':
    case 'code':
    case 'tech':
      return <Code2 {...props} />;
    case 'hammer':
    case 'crafts':
    case 'diy':
      return <Hammer {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    default:
      return <Layers {...props} />;
  }
};
