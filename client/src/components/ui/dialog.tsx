"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, Minimize2, Maximize2, ZoomIn, ZoomOut } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

interface ResizableDialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  enableResize?: boolean
  enableZoom?: boolean
  defaultSize?: "sm" | "md" | "lg" | "xl" | "full"
  minWidth?: number
  minHeight?: number
}

const ResizableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResizableDialogContentProps
>(({ className, children, enableResize = true, enableZoom = true, defaultSize = "md", minWidth = 320, minHeight = 200, ...props }, ref) => {
  const [size, setSize] = React.useState<"sm" | "md" | "lg" | "xl" | "full">(defaultSize)
  const [zoom, setZoom] = React.useState(100)
  const [isMinimized, setIsMinimized] = React.useState(false)
  
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[95vw] max-h-[95vh]"
  }
  
  const toggleSize = () => {
    const sizes: Array<"sm" | "md" | "lg" | "xl" | "full"> = ["sm", "md", "lg", "xl", "full"]
    const currentIndex = sizes.indexOf(size)
    const nextIndex = (currentIndex + 1) % sizes.length
    setSize(sizes[nextIndex])
  }
  
  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 150))
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 70))
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        style={{ 
          transform: `translate(-50%, -50%) scale(${zoom / 100})`,
          minWidth: isMinimized ? 200 : minWidth,
          minHeight: isMinimized ? 48 : minHeight,
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg transition-all",
          sizeClasses[size],
          isMinimized ? "h-12 overflow-hidden p-2" : "p-6",
          className
        )}
        {...props}
      >
        <div className={cn(
          "absolute top-2 flex items-center gap-1",
          "right-12 rtl:right-auto rtl:left-12"
        )}>
          {enableZoom && !isMinimized && (
            <>
              <button
                onClick={zoomOut}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                data-testid="button-dialog-zoom-out"
                title="تصغير العرض / Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[3ch] text-center">{zoom}%</span>
              <button
                onClick={zoomIn}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                data-testid="button-dialog-zoom-in"
                title="تكبير العرض / Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {enableResize && (
            <>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                data-testid="button-dialog-minimize"
                title={isMinimized ? "استعادة / Restore" : "تصغير / Minimize"}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={toggleSize}
                className="rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                data-testid="button-dialog-maximize"
                title="تغيير الحجم / Toggle Size"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
        {!isMinimized && children}
        {isMinimized && (
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            انقر للاستعادة / Click to restore
          </div>
        )}
        <DialogPrimitive.Close className="absolute right-4 top-4 rtl:right-auto rtl:left-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
ResizableDialogContent.displayName = "ResizableDialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  ResizableDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
