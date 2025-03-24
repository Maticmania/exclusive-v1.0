"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const Sidebar = React.forwardRef(({ className, children, collapsible = "md", variant = "default", ...props }, ref) => {
  return (
    <aside
      ref={ref}
      className={cn(
        "group relative flex flex-col",
        collapsible === "always" && "md:w-[var(--sidebar-width)]",
        collapsible === "md" && "md:w-[var(--sidebar-width)]",
        variant === "floating" && "rounded-xl border bg-card text-card-foreground shadow-sm",
        className,
      )}
      style={{ "--sidebar-width": "240px" }}
      {...props}
    >
      {children}
    </aside>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 rounded-md border border-input bg-background text-sm ring-offset-background transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex h-16 items-center justify-between px-6", className)} {...props} />
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1 overflow-y-auto py-2 px-1", className)} {...props} />
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex items-center px-6 py-4", className)} {...props} />
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("menu", className)} {...props}></ul>
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => {
  return <li ref={ref} className={cn(className)} {...props}></li>
})
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, isActive, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "span"

  return (
    <Comp
      ref={ref}
      className={cn(
        "group flex w-full items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground [&:has([data-active])]:bg-secondary [&:has([data-active])]:text-secondary-foreground",
        isActive && "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarMenuLabel = React.forwardRef(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("px-6 py-2 text-sm font-bold", className)} {...props} />
})
SidebarMenuLabel.displayName = "SidebarMenuLabel"

export const SidebarSection = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("mt-6 first:mt-0 pt-6 first:pt-0", className)} {...props} />
})
SidebarSection.displayName = "SidebarSection"

const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("group", className)} {...props} />
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, ...props }, ref) => {
  return <p ref={ref} className={cn("px-6 py-2 text-sm font-bold", className)} {...props} />
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("menu", className)} {...props} />
})
SidebarGroupContent.displayName = "SidebarGroupContent"

export {
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
}

