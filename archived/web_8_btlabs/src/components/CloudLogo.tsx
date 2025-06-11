interface CloudLogoProps {
  className?: string;
}

export const CloudLogo = ({ className = "h-8 w-auto" }: CloudLogoProps) => (
  <svg className={className} viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
    <text
      x="0"
      y="45"
      fontFamily="Arial, sans-serif"
      fontSize="42"
      fontWeight="300"
      fill="#5BCCD6"
      letterSpacing="1px"
    >
      cloud
    </text>
  </svg>
);
