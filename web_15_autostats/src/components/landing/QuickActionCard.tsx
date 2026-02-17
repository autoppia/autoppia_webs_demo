'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeedLink } from '@/components/ui/SeedLink';
import { DynamicText } from '@/dynamic/v3/DynamicText';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  icon?: React.ReactNode;
}

export function QuickActionCard({
  title,
  description,
  buttonText,
  buttonHref,
  icon,
}: QuickActionCardProps) {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-2 border-transparent bg-clip-padding relative overflow-hidden">
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 opacity-20 blur-xl" />
      <div className="absolute inset-[2px] rounded-[10px] bg-zinc-900" />
      
      {/* Content */}
      <div className="relative z-10">
        <CardHeader className="pb-4">
          {icon && (
            <div className="mb-4 text-cyan-400">
              {icon}
            </div>
          )}
          <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-2">
            <DynamicText value={title} type="text" />
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-zinc-400">
            <DynamicText value={description} type="text" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeedLink href={buttonHref}>
            <Button 
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-blue-500/40"
            >
              <DynamicText value={buttonText} type="text" />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </SeedLink>
        </CardContent>
      </div>
    </Card>
  );
}
