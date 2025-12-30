'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
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
import { EVENT_TYPES, logEvent } from '@/library/events';
import { useDynamicSystem } from '@/dynamic/shared';
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from '@/dynamic/v3/utils/variant-selector';

interface ToolbarProps {
  onMenuClick?: () => void;
  textStructure?: TextStructureConfig;
}

export function Toolbar({ onMenuClick, textStructure }: ToolbarProps) {
  const { currentVariant } = useLayout();
  const dyn = useDynamicSystem();
  const { searchQuery, setSearchQuery } = useEmail();
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchQuery(searchValue);
    setIsSearching(false);
    logEvent(EVENT_TYPES.SEARCH_EMAIL, { query: searchValue });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (value === '') {
      setSearchQuery('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timeout = setTimeout(() => {
      setSearchQuery(value);
      setIsSearching(false);
      logEvent(EVENT_TYPES.SEARCH_EMAIL, { query: value });
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTimeout) clearTimeout(searchTimeout);
      setSearchQuery(searchValue);
      setIsSearching(false);
    }
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  const clearSearch = () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchValue('');
    setSearchQuery('');
    setIsSearching(false);
  };

  const toolbarId = dyn.v3.getVariant('toolbar', ID_VARIANTS_MAP, 'toolbar');
  const toolbarClass = cn(
    dyn.v3.getVariant('toolbar-row', CLASS_VARIANTS_MAP, 'flex items-center gap-3 px-4 py-3'),
    'h-16 toolbar-glass',
    currentVariant.id === 2 && 'search-container',
    currentVariant.id === 3 && 'search-header',
    currentVariant.id === 4 && 'toolbar-header',
    currentVariant.id === 5 && 'search-wrapper',
    currentVariant.id === 6 && 'bottom-toolbar',
    currentVariant.id === 7 && 'dashboard-header',
    currentVariant.id === 8 && 'mobile-header',
    currentVariant.id === 9 && 'terminal-header',
    currentVariant.id === 10 && 'magazine-header'
  );

  const searchInputId = dyn.v3.getVariant('search_input', ID_VARIANTS_MAP, 'search-input');
  const searchInputClass = dyn.v3.getVariant(
    'toolbar-search-input',
    CLASS_VARIANTS_MAP,
    'pl-10 pr-12 h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring'
  );

  const placeholderText = dyn.v3.getVariant(
    'search_placeholder',
    TEXT_VARIANTS_MAP,
    textStructure?.search_placeholder || 'Search mail'
  );

  const composeLabel = dyn.v3.getVariant('compose_cta', TEXT_VARIANTS_MAP, textStructure?.compose || 'Compose');

  const renderThemeButton = (label: string, value: 'light' | 'dark' | 'system', icon: React.ReactNode) => (
    <Button
      id={dyn.v3.getVariant(`theme-${value}-btn`, ID_VARIANTS_MAP, `theme-${value}-btn`)}
      variant={theme === value ? 'secondary' : 'ghost'}
      size="sm"
      onClick={() => {
        setTheme(value);
        logEvent(EVENT_TYPES.THEME_CHANGED, { theme: value });
      }}
      aria-label={dyn.v3.getVariant('theme_toggle', TEXT_VARIANTS_MAP, 'Toggle theme')}
      className={cn(
        currentVariant.id === 2 && 'theme-toggle',
        currentVariant.id === 3 && 'theme-btn',
        currentVariant.id === 4 && 'theme-element',
        currentVariant.id === 5 && 'header-theme',
        currentVariant.id === 6 && 'bottom-theme',
        currentVariant.id === 7 && 'header-theme',
        currentVariant.id === 8 && 'header-theme',
        currentVariant.id === 9 && 'header-theme',
        currentVariant.id === 10 && 'header-theme'
      )}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  );

  return dyn.v1.addWrapDecoy('toolbar-wrapper', (
    <div id={toolbarId} className={toolbarClass} data-dyn-key="toolbar">
      <div className="flex items-center justify-between h-full px-6 gap-4 w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            id={dyn.v3.getVariant('toolbar-actions', ID_VARIANTS_MAP, 'menu-button')}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {dyn.v3.getVariant('app_title', TEXT_VARIANTS_MAP, textStructure?.app_name || 'AutoMail')}
            </span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl">
          {dyn.v1.addWrapDecoy('toolbar-search-wrapper', (
            <form
              onSubmit={handleSearchSubmit}
              className={cn('relative', dyn.v3.getVariant('filter-bar', CLASS_VARIANTS_MAP, ''))}
              id={dyn.v3.getVariant('filter-bar', ID_VARIANTS_MAP, 'filter-bar')}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                id={searchInputId}
                placeholder={placeholderText}
                value={searchValue}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                className={searchInputClass}
              />

              {(searchValue || searchQuery) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted"
                  id={dyn.v3.getVariant('quick-action', ID_VARIANTS_MAP, 'clear-search')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}

              {isSearching && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
            </form>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                id={dyn.v3.getVariant('sidebar-compose', ID_VARIANTS_MAP, 'user-menu-btn')}
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={dyn.v3.getVariant('theme_toggle', TEXT_VARIANTS_MAP, 'User account menu')}
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
                  <p className="text-sm font-medium">{dyn.v3.getVariant('app_title', TEXT_VARIANTS_MAP, 'User Account')}</p>
                  <p className="text-xs text-muted-foreground">user@gmail.com</p>
                </div>
              </div>

              <DropdownMenuSeparator />

              <div className="p-2" data-testid="theme-toggle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{dyn.v3.getVariant('theme_toggle', TEXT_VARIANTS_MAP, 'Theme')}</span>
                  {theme === 'light' ? <Sun className="h-4 w-4" /> : theme === 'dark' ? <Moon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Light</span>
                    {renderThemeButton('Light', 'light', <Sun className="h-3 w-3" />)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dark</span>
                    {renderThemeButton('Dark', 'dark', <Moon className="h-3 w-3" />)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System</span>
                    {renderThemeButton('System', 'system', <Monitor className="h-3 w-3" />)}
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
  ));
}
