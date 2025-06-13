interface BittensorCloudLogoProps {
  className?: string;
}

export const BittensorCloudLogo = ({ className = "h-6 w-auto" }: BittensorCloudLogoProps) => (
  <img
    src="/uploads/BittensorCloud-Logo_1.png"
    alt="BittensorCloud"
    className={className}
  />
);
