// src/components/DynamicContainer.tsx

import { useState, useEffect, useRef } from "react";
import { useSeedLayout } from "@/dynamic/v3-dynamic";

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
	const containerRef = useRef<HTMLDivElement>(null);
	const {
		getLayoutClasses,
		generateId,
		generateSeedClass,
		applyCSSVariables,
		createDynamicStyles
	} = useSeedLayout();

	const [containerClasses, setContainerClasses] = useState("");
	const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

	useEffect(() => {
		const layoutClasses = getLayoutClasses('container');
		const elementId = generateId('container', index);
		const seedClass = generateSeedClass('dynamic-container');
		
		setContainerClasses(`${layoutClasses} ${seedClass} ${className}`.trim());
		setDynamicStyles(createDynamicStyles());
	}, [className, index, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

	useEffect(() => {
		if (containerRef.current) {
			applyCSSVariables(containerRef.current);
		}
	}, [dynamicStyles, applyCSSVariables]);

	return (
		<div 
			ref={containerRef}
			id={generateId('container', index)}
			className={containerClasses}
			style={dynamicStyles}
			{...rest}
		>
			{children}
		</div>
	);
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
	const itemRef = useRef<HTMLDivElement>(null);
	const {
		getLayoutClasses,
		generateId,
		generateSeedClass,
		applyCSSVariables,
		createDynamicStyles
	} = useSeedLayout();

	const [itemClasses, setItemClasses] = useState("");
	const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

	useEffect(() => {
		const layoutClasses = getLayoutClasses('item');
		const elementId = generateId('item', index);
		const seedClass = generateSeedClass('dynamic-item');
		
		setItemClasses(`${layoutClasses} ${seedClass} ${className}`.trim());
		setDynamicStyles(createDynamicStyles());
	}, [className, index, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

	useEffect(() => {
		if (itemRef.current) {
			applyCSSVariables(itemRef.current);
		}
	}, [dynamicStyles, applyCSSVariables]);

	return (
		<div 
			ref={itemRef}
			id={generateId('item', index)}
			className={itemClasses}
			style={dynamicStyles}
			{...rest}
		>
			{children}
		</div>
	);
}
