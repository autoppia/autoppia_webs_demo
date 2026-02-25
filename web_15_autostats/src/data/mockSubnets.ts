import { generateSubnets } from './generators';

// Generate 32 mock subnets
export const mockSubnets = generateSubnets(32);

export function getSubnetById(id: number) {
  return mockSubnets.find(subnet => subnet.id === id);
}

export function getAllSubnets() {
  return mockSubnets;
}

export function searchSubnets(query: string) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return mockSubnets.slice(0, 10);
  return mockSubnets.filter(
    (subnet) =>
      subnet.name.toLowerCase().includes(lowerQuery) ||
      subnet.id.toString().includes(lowerQuery) ||
      subnet.description.toLowerCase().includes(lowerQuery)
  );
}
