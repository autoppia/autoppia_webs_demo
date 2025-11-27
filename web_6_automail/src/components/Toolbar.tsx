'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { useEmail } from '@/contexts/EmailContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useDynamicStructure } from '@/contexts/DynamicStructureContext';
import { cn } from '@/library/utils';
import { TextStructureConfig } from '@/utils/textStructureProvider';
import {
  Search,
  Menu,
  Settings,
  HelpCircle,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Grid3X3,
  X,
} from 'lucide-react';
import { EVENT_TYPES, logEvent } from "@/library/events";
import { useV3Attributes } from "@/dynamic/v3-dynamic";
interface ToolbarProps {
  onMenuClick?: () => void;
  textStructure?: TextStructureConfig;
}

export function Toolbar({ onMenuClick, textStructure }: ToolbarProps) {
  const { currentVariant } = useLayout();
  const { getText, getId } = useDynamicStructure();
  const { getText: getV3Text, getId: getV3Id } = useV3Attributes();
  const { searchQuery, setSearchQuery, filteredEmails } = useEmail();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Sync search value when context changes
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchQuery(searchValue);
    setIsSearching(false);
    logEvent(EVENT_TYPES.SEARCH_EMAIL, { query: searchValue });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Immediate search for empty value
    if (value === '') {
      setSearchQuery('');
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Debounced search - update context after user stops typing for 300ms
    const timeout = setTimeout(() => {
      setSearchQuery(value);
      setIsSearching(false);
      logEvent(EVENT_TYPES.SEARCH_EMAIL, { query: value });
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      setSearchQuery(searchValue);
      setIsSearching(false);
    }
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const clearSearch = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchValue('');
    setSearchQuery('');
    setIsSearching(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      "h-16 toolbar-glass",
      currentVariant.id === 2 && "search-container",
      currentVariant.id === 3 && "search-header",
      currentVariant.id === 4 && "toolbar-header",
      currentVariant.id === 5 && "search-wrapper",
      currentVariant.id === 6 && "bottom-toolbar",
      currentVariant.id === 7 && "dashboard-header",
      currentVariant.id === 8 && "mobile-header",
      currentVariant.id === 9 && "terminal-header",
      currentVariant.id === 10 && "magazine-header"
    )}>
      <div className="flex items-center justify-between h-full px-4 gap-4">
        {/* Left Section - Menu and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {textStructure?.app_name || 'AutoMail'}
            </span>
          </div>
        </div>

        {/* Center Section - Enhanced Search */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              id={getV3Id("search_input", textStructure?.ids.search_input || getId("search_input"))}
              placeholder={getV3Text("search_placeholder", textStructure?.search_placeholder || getText("search_placeholder"))}
              value={searchValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "pl-10 pr-12 h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring",
                currentVariant.id === 2 && "search-field",
                currentVariant.id === 3 && "header-search",
                currentVariant.id === 4 && "search-element",
                currentVariant.id === 5 && "search-field",
                currentVariant.id === 6 && "bottom-search",
                currentVariant.id === 7 && "header-search",
                currentVariant.id === 8 && "header-search",
                currentVariant.id === 9 && "header-search",
                currentVariant.id === 10 && "header-search"
              )}
            />

            {/* Clear Search Button */}
            {(searchValue || searchQuery) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              </div>
            )}
          </form>

         
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-2">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                id={textStructure?.ids.user_menu || "user-menu-btn"} 
                variant="ghost" 
                size="icon" 
                className="relative"
                aria-label={textStructure?.aria_labels.user_menu || "User account menu"}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">U</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-3 p-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">U</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{textStructure?.user_account || 'User Account'}</p>
                  <p className="text-xs text-muted-foreground">user@gmail.com</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Theme Selection */}
              <div className="p-2" data-testid="theme-toggle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Theme</span>
                  {getThemeIcon()}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{textStructure?.theme_light || 'Light'}</span>
                    <Button
                      id={textStructure?.ids.theme_light_btn || "theme-light-btn"}
                      variant={theme === 'light' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setTheme('light');
                        logEvent(EVENT_TYPES.THEME_CHANGED, { theme: 'light' });
                      }}
                      aria-label={textStructure?.aria_labels.theme_toggle || "Toggle theme"}
                      className={cn(
                        currentVariant.id === 2 && "theme-toggle",
                        currentVariant.id === 3 && "theme-btn",
                        currentVariant.id === 4 && "theme-element",
                        currentVariant.id === 5 && "header-theme",
                        currentVariant.id === 6 && "bottom-theme",
                        currentVariant.id === 7 && "header-theme",
                        currentVariant.id === 8 && "header-theme",
                        currentVariant.id === 9 && "header-theme",
                        currentVariant.id === 10 && "header-theme"
                      )}
                    >
                      <Sun className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{textStructure?.theme_dark || 'Dark'}</span>
                    <Button
                      id={textStructure?.ids.theme_dark_btn || "theme-dark-btn"}
                      variant={theme === 'dark' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setTheme('dark');
                        logEvent(EVENT_TYPES.THEME_CHANGED, { theme: 'dark' });
                      }}
                      aria-label={textStructure?.aria_labels.theme_toggle || "Toggle theme"}
                      className={cn(
                        currentVariant.id === 2 && "theme-toggle",
                        currentVariant.id === 3 && "theme-btn",
                        currentVariant.id === 4 && "theme-element",
                        currentVariant.id === 5 && "header-theme",
                        currentVariant.id === 6 && "bottom-theme",
                        currentVariant.id === 7 && "header-theme",
                        currentVariant.id === 8 && "header-theme",
                        currentVariant.id === 9 && "header-theme",
                        currentVariant.id === 10 && "header-theme"
                      )}
                    >
                      <Moon className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{textStructure?.theme_system || 'System'}</span>
                    <Button
                      id={textStructure?.ids.theme_system_btn || "theme-system-btn"}
                      variant={theme === 'system' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        setTheme('system');
                        logEvent(EVENT_TYPES.THEME_CHANGED, { theme: 'system' });
                      }}
                      aria-label={textStructure?.aria_labels.theme_toggle || "Toggle theme"}
                      className={cn(
                        currentVariant.id === 2 && "theme-toggle",
                        currentVariant.id === 3 && "theme-btn",
                        currentVariant.id === 4 && "theme-element",
                        currentVariant.id === 5 && "header-theme",
                        currentVariant.id === 6 && "bottom-theme",
                        currentVariant.id === 7 && "header-theme",
                        currentVariant.id === 8 && "header-theme",
                        currentVariant.id === 9 && "header-theme",
                        currentVariant.id === 10 && "header-theme"
                      )}
                    >
                      <Monitor className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
