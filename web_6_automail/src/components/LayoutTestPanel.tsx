"use client";

import React from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useEmail } from "@/contexts/EmailContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export function LayoutTestPanel() {
  const { currentVariant, seed } = useLayout();
  const { currentEmail, emails } = useEmail();

  const testElements = [
    {
      name: "Toolbar",
      selector: ".toolbar-glass",
      description: "Top toolbar with search and controls"
    },
    {
      name: "Sidebar",
      selector: ".sidebar-gradient",
      description: "Navigation sidebar"
    },
    {
      name: "Email List",
      selector: "[data-testid='email-list'], .email-list, .email-item-hover, .email-container, .email-card, .email-entry, .email-row, .widget-email, .mobile-email, .terminal-line, .magazine-article",
      description: "List of email items"
    },
    {
      name: "Email View",
      selector: "[data-testid='email-view']",
      description: "Email detail view"
    },
    {
      name: "Compose Button",
      selector: "button:contains('Compose')",
      description: "Compose new email button"
    },
    {
      name: "Search Input",
      selector: "input[placeholder*='Search']",
      description: "Search functionality"
    },
    {
      name: "Theme Toggle",
      selector: "[data-testid='theme-toggle'], #theme-light-btn, #theme-dark-btn, #theme-system-btn, button[aria-label*='theme'], button[aria-label*='Theme']",
      description: "Theme switching controls"
    }
  ];

  const checkElementVisibility = (selector: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Handle multiple selectors
      const selectors = selector.split(', ');
      for (const sel of selectors) {
        if (sel.includes(':contains(')) {
          // Handle text-based selectors
          const text = sel.match(/:contains\('([^']+)'\)/)?.[1];
          const elements = Array.from(document.querySelectorAll('button')).filter(el => 
            el.textContent?.includes(text || '')
          );
          if (elements.length > 0) return true;
        } else {
          const elements = document.querySelectorAll(sel);
          if (elements.length > 0) return true;
        }
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const getLayoutInfo = () => {
    switch (currentVariant.id) {
      case 1: return { name: "Classic Gmail", description: "Traditional Gmail-like layout" };
      case 2: return { name: "Right Sidebar", description: "Sidebar on the right side" };
      case 3: return { name: "Top Navigation", description: "Navigation at the top" };
      case 4: return { name: "Split View", description: "Three-panel split layout" };
      case 5: return { name: "Card Layout", description: "Email items as cards" };
      case 6: return { name: "Minimalist", description: "Clean, minimal interface" };
      case 7: return { name: "Dashboard Style", description: "Dashboard-like layout" };
      case 8: return { name: "Mobile First", description: "Mobile-optimized layout" };
      case 9: return { name: "Terminal Style", description: "Command-line inspired" };
      case 10: return { name: "Magazine Layout", description: "Magazine-style grid" };
      default: return { name: "Unknown", description: "Unknown layout" };
    }
  };

  const layoutInfo = getLayoutInfo();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Layout Test Panel</h3>
        <Badge variant="outline" className="text-xs">
          Variant {seed}
        </Badge>
      </div>
      
      <div className="mb-3">
        <p className="text-xs font-medium text-foreground">{layoutInfo.name}</p>
        <p className="text-xs text-muted-foreground">{layoutInfo.description}</p>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Element Visibility:</div>
        {testElements.map((element) => {
          const isVisible = checkElementVisibility(element.selector);
          return (
            <div key={element.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {isVisible ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={isVisible ? "text-foreground" : "text-muted-foreground"}>
                  {element.name}
                </span>
              </div>
              <span className="text-muted-foreground text-xs">
                {isVisible ? "✓" : "✗"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div>Emails: {emails.length}</div>
          <div>Current Email: {currentEmail ? "Selected" : "None"}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs"
          onClick={() => {
            const url = new URL(window.location.href);
            const currentSeed = parseInt(url.searchParams.get('seed') || '1');
            const nextSeed = currentSeed === 10 ? 1 : currentSeed + 1;
            if (nextSeed === 1) {
              url.searchParams.delete('seed');
            } else {
              url.searchParams.set('seed', nextSeed.toString());
            }
            window.location.href = url.toString();
          }}
        >
          Next Variant
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs"
          onClick={() => {
            const url = new URL(window.location.href);
            const currentSeed = parseInt(url.searchParams.get('seed') || '1');
            const prevSeed = currentSeed === 1 ? 10 : currentSeed - 1;
            if (prevSeed === 1) {
              url.searchParams.delete('seed');
            } else {
              url.searchParams.set('seed', prevSeed.toString());
            }
            window.location.href = url.toString();
          }}
        >
          Prev Variant
        </Button>
      </div>
    </div>
  );
} 