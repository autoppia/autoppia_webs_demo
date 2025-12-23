// src/components/DynamicContainer.tsx
// @deprecated - Use useDynamicSystem() directly instead

import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP } from "@/dynamic/v3";

interface DynamicContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	index?: number;
}

export function DynamicContainer({
	children,
	className = "",
	index = 0,
	...rest
}: DynamicContainerProps) {
	const dyn = useDynamicSystem();
	
	const containerId = index > 0
		? dyn.v3.getVariant(`container-${index}`, ID_VARIANTS_MAP, `container-${index}`)
		: dyn.v3.getVariant("container", ID_VARIANTS_MAP, "container");

	return dyn.v1.addWrapDecoy("container", (
		<div 
			id={containerId}
			className={className}
			{...rest}
		>
			{children}
		</div>
	), `container-wrap-${index}`);
}

interface DynamicItemProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	index?: number;
}

export function DynamicItem({
	children,
	className = "",
	index = 0,
	...rest
}: DynamicItemProps) {
	const dyn = useDynamicSystem();
	
	const itemId = index > 0
		? dyn.v3.getVariant(`item-${index}`, ID_VARIANTS_MAP, `item-${index}`)
		: dyn.v3.getVariant("item", ID_VARIANTS_MAP, "item");

	return dyn.v1.addWrapDecoy("item", (
		<div 
			id={itemId}
			className={className}
			{...rest}
		>
			{children}
		</div>
	), `item-wrap-${index}`);
}
