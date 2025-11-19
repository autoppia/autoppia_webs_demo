"use client";

import { useSeedLayout } from "@/dynamic/v3-dynamic";
import { DynamicElement } from "@/components/DynamicElement";
import { SeedLink } from "@/components/ui/SeedLink";

export default function Footer() {
  const { reorderElements } = useSeedLayout();

  const linkGroups = [
    {
      key: 'company',
      title: 'Company',
      items: [
        { href: '#', label: 'About' },
        { href: '#', label: 'Contact' },
      ],
    },
    {
      key: 'legal',
      title: 'Legal',
      items: [
        { href: '#', label: 'Privacy' },
        { href: '#', label: 'Terms' },
      ],
    },
  ];

  const orderedGroups = reorderElements(linkGroups);

  const sections = [
    { key: 'brand' },
    { key: 'links' },
    { key: 'copyright' },
  ];
  const orderedSections = reorderElements(sections);

  return (
    <footer className="border-t">
      <div className="container grid gap-4 py-8 md:grid-cols-3">
        {orderedSections.map((s, idx) => (
          <DynamicElement key={s.key} elementType="footer-section" as="div" index={idx}>
            {s.key === 'brand' && (
              <div>
                <div className="font-semibold text-emerald-700">AutoHealth</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Demo healthcare portal for AI agents training.
                </p>
              </div>
            )}
            {s.key === 'links' && (
              <div className="flex gap-6">
                {orderedGroups.map((g, gi) => (
                  <DynamicElement key={g.key} elementType="footer-group" as="div" index={gi}>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">{g.title}</div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {g.items.map((it, ii) => (
                          <li key={ii}>
                            <SeedLink href={it.href} className="hover:text-foreground">
                              {it.label}
                            </SeedLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </DynamicElement>
                ))}
              </div>
            )}
            {s.key === 'copyright' && (
              <div className="text-sm text-muted-foreground md:text-right">
                © {new Date().getFullYear()} AutoHealth. Demo only.
              </div>
            )}
          </DynamicElement>
        ))}
      </div>
    </footer>
  );
}
