import { SubnetDetailPageContent } from '@/components/pages/SubnetDetailPageContent';
import { generateSubnetsWithTrends, generateTransactionsWithMethods } from '@/data/generators';

export default async function SubnetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const subnetId = Number.parseInt(id);
  
  // Generate subnet data
  const subnets = generateSubnetsWithTrends(50, 12345);
  const subnet = subnets.find(s => s.id === subnetId);
  
  if (!subnet) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Subnet Not Found</h1>
          <p className="text-zinc-400">The subnet you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  // Generate transactions for this subnet
  const transactions = generateTransactionsWithMethods(50, subnetId);
  
  return <SubnetDetailPageContent subnet={subnet} transactions={transactions} />;
}
