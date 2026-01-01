import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Blocks, GripVertical, Copy, Loader2, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Component } from "@shared/schema";

interface ComponentLibraryProps {
  onInsertComponent: (html: string, css: string, js: string) => void;
  currentFramework?: 'vanilla' | 'tailwind' | 'bootstrap';
}

export function ComponentLibrary({ onInsertComponent, currentFramework = 'vanilla' }: ComponentLibraryProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  const { data: components, isLoading } = useQuery<Component[]>({
    queryKey: ["/api/components"],
    enabled: open,
  });

  const categories = components 
    ? ["all", ...Array.from(new Set(components.map((c) => c.category)))]
    : ["all"];

  const filteredComponents = components?.filter((c) => {
    const categoryMatch = selectedCategory === "all" || c.category === selectedCategory;
    const frameworkMatch = c.framework === currentFramework || c.framework === 'vanilla';
    return categoryMatch && frameworkMatch;
  }) || [];

  const handleInsert = (component: Component) => {
    onInsertComponent(component.htmlCode, component.cssCode, component.jsCode);
    toast({ title: `Added ${component.name}` });
  };

  const handleCopy = (component: Component) => {
    const fullCode = `<!-- ${component.name} -->\n${component.htmlCode}\n\n<style>\n${component.cssCode}\n</style>${component.jsCode ? `\n\n<script>\n${component.jsCode}\n</script>` : ''}`;
    navigator.clipboard.writeText(fullCode);
    toast({ title: "Component code copied!" });
  };

  const getFrameworkBadge = (framework: string) => {
    const colors: Record<string, string> = {
      vanilla: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
      tailwind: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      bootstrap: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[framework] || colors.vanilla;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-component-library">
          <Blocks className="h-4 w-4" />
          Components
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Blocks className="h-5 w-5" />
            Component Library
          </SheetTitle>
          <SheetDescription>Drag components or click to insert into your project</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap gap-1 h-auto">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="text-xs capitalize"
                  data-testid={`tab-category-${category}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredComponents.length > 0 ? (
              <div className="space-y-3 pr-4">
                {filteredComponents.map((component) => (
                  <div
                    key={component.id}
                    className="p-4 rounded-md border bg-card hover-elevate cursor-pointer"
                    data-testid={`component-${component.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground mt-1">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{component.name}</h4>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getFrameworkBadge(component.framework)}`}
                          >
                            {component.framework}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {component.category}
                        </p>
                        
                        <div className="bg-muted/50 rounded-md p-3 mb-3 max-h-24 overflow-hidden">
                          <pre className="text-xs text-muted-foreground overflow-hidden">
                            <code>{component.htmlCode.substring(0, 150)}...</code>
                          </pre>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleInsert(component)}
                            className="gap-1"
                            data-testid={`button-insert-${component.id}`}
                          >
                            <Code className="h-3 w-3" />
                            Insert
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(component)}
                            className="gap-1"
                            data-testid={`button-copy-${component.id}`}
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No components found for this category and framework.
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
