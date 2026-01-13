"use client";

import { useDynamicSystem } from "@/dynamic/shared";
import { SeedLink } from "@/components/ui/SeedLink";
import { useMemo } from "react";

export default function Footer() {
  const dyn = useDynamicSystem();

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

  const orderedGroups = useMemo(() => {
    const order = dyn.v1.changeOrderElements("footer-groups", linkGroups.length);
    return order.map((idx) => linkGroups[idx]);
  }, [dyn.seed, linkGroups]);

  const sections = [
    { key: 'brand' },
    { key: 'links' },
    { key: 'copyright' },
  ];
  const orderedSections = useMemo(() => {
    const order = dyn.v1.changeOrderElements("footer-sections", sections.length);
    return order.map((idx) => sections[idx]);
  }, [dyn.seed, sections]);

  return (
    <footer className="border-t">
      {dyn.v1.addWrapDecoy("footer-container", (
        <div className="container grid gap-4 py-8 md:grid-cols-3">
          {orderedSections.map((s, idx) => (
            dyn.v1.addWrapDecoy(`footer-section-${idx}`, (
              <div key={s.key}>
                {s.key === 'brand' && (
                  dyn.v1.addWrapDecoy("footer-brand", (
                    <div>
                      <div className="font-semibold text-emerald-700">AutoHealth</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Demo healthcare portal for AI agents training.
                      </p>
                    </div>
                  ))
                )}
                {s.key === 'links' && (
                  dyn.v1.addWrapDecoy("footer-links", (
                    <div className="flex gap-6">
                      {orderedGroups.map((g, gi) => (
                        dyn.v1.addWrapDecoy(`footer-group-${gi}`, (
                          <div key={g.key} className="space-y-2">
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
                        ), `footer-group-${gi}`)
                      ))}
                    </div>
                  ))
                )}
                {s.key === 'copyright' && (
                  dyn.v1.addWrapDecoy("footer-copyright", (
                    <div className="text-sm text-muted-foreground md:text-right">
                      © {new Date().getFullYear()} AutoHealth. Demo only.
                    </div>
                  ))
                )}
              </div>
            ), `footer-section-${idx}`)
          ))}
        </div>
      ))}
    </footer>
  );
}
