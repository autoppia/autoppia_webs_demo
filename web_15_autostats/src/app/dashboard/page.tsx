'use client';

import React, { useEffect, useState } from 'react';
import { useSeed } from '@/context/SeedContext';
import { useEventLogger } from '@/hooks/useEventLogger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type EventStats = {
  totalEvents: number;
  byType: Record<string, number>;
  byRoute: Record<string, number>;
  byHour: Record<string, number>;
  seeds: {
    totalSeeds: number;
    topSeeds: { seed: string; count: number }[];
  };
};

export default function DashboardPage() {
  const { seed } = useSeed();
  const { logInteraction } = useEventLogger();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logInteraction('page_view', { page: 'dashboard' });
  }, [logInteraction]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/stats', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load stats: ${res.status}`);
        }
        const data = (await res.json()) as EventStats;
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasData = stats && stats.totalEvents > 0;

  return (
    <div className="py-8 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Event Analytics Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Aggregate view of recorded interactions in AutoStats. Current seed:{' '}
            <span className="font-mono text-zinc-100">{seed}</span>
          </p>
        </div>
        <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-300 bg-zinc-900/40">
          Experimental
        </Badge>
      </div>

      {loading && (
        <div className="text-zinc-400">
          Loading event statistics…
        </div>
      )}

      {error && (
        <Card className="border-red-900/60 bg-red-950/40">
          <CardHeader>
            <CardTitle className="text-red-300">Failed to load stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-200">{error}</p>
            <p className="text-xs text-red-300/80 mt-2">
              Make sure the logging server is running and that <code>event-log.json</code> is accessible.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && !hasData && (
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-zinc-100">No events recorded yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400">
              We haven&apos;t recorded any events in <code>event-log.json</code> yet.
              Interact with the app (navigation, actions) and then refresh this page to see analytics.
            </p>
          </CardContent>
        </Card>
      )}

      {hasData && stats && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-emerald-400">
                {stats.totalEvents.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                All recorded interactions across routes and seeds.
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100">Distinct Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-sky-400">
                {Object.keys(stats.byRoute).length}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Pages that have produced at least one logged event.
              </p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100">Tracked Seeds</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold text-violet-400">
                {stats.seeds.totalSeeds}
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Unique seeds encountered in the event log.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {hasData && stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100">Events by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-zinc-400">Type</TableHead>
                    <TableHead className="text-zinc-400 text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.byType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <TableRow key={type}>
                        <TableCell className="font-mono text-xs text-zinc-200">{type}</TableCell>
                        <TableCell className="text-right text-zinc-100">
                          {count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100">Top Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-zinc-400">Route</TableHead>
                    <TableHead className="text-zinc-400 text-right">Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(stats.byRoute)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([route, count]) => (
                      <TableRow key={route}>
                        <TableCell className="font-mono text-xs text-zinc-200">{route}</TableCell>
                        <TableCell className="text-right text-zinc-100">
                          {count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {hasData && stats && stats.seeds.topSeeds.length > 0 && (
        <Card className="border-zinc-800 bg-zinc-900/40">
          <CardHeader>
            <CardTitle className="text-zinc-100">Top Seeds by Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.seeds.topSeeds.map(({ seed: seedValue, count }) => (
                <div
                  key={seedValue}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2"
                >
                  <span className="font-mono text-xs text-zinc-100">
                    seed={seedValue}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {count.toLocaleString()} events
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

