import { generateSubnets } from './generators';

// Generate 32 mock subnets
export const mockSubnets = generateSubnets(32);

export function getSubnetById(id: number) {
  return mockSubnets.find(subnet => subnet.id === id);
}

export function getAllSubnets() {
  return mockSubnets;
}
