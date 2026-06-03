import {
  BookOpen,
  Brain,
  Calculator,
  Crosshair,
  Cuboid,
  Eye,
  GitBranch,
  ListChecks,
  MessageSquareText,
  Network,
  Puzzle,
  Scale,
  Zap,
} from "lucide-react";

interface CognitiveDomainIconProps {
  iconName: string;
  className?: string;
}

const icons = {
  BookOpen,
  Brain,
  Calculator,
  Crosshair,
  Cuboid,
  Eye,
  GitBranch,
  ListChecks,
  MessageSquareText,
  Network,
  Puzzle,
  Scale,
  Zap,
};

export function CognitiveDomainIcon({ iconName, className = "h-6 w-6" }: CognitiveDomainIconProps) {
  const Icon = icons[iconName as keyof typeof icons] ?? Brain;

  return <Icon className={className} />;
}
