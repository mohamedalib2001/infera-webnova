import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface DocLinkButtonProps {
  pageId: string;
  className?: string;
}

export function DocLinkButton({ pageId, className }: DocLinkButtonProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const isOwner = user?.role === "owner" || user?.role === "sovereign" || user?.role === "ROOT_OWNER";
  
  if (!isOwner) return null;
  
  const handleClick = () => {
    setLocation(`/technical-docs?page=${pageId}`);
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClick}
          className={className}
          data-testid={`button-doc-link-${pageId}`}
        >
          <FileText className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Technical Documentation</p>
      </TooltipContent>
    </Tooltip>
  );
}
