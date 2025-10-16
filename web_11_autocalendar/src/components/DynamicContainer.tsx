// src/components/DynamicContainer.tsx

import { useState, useEffect, useRef } from 'react';
import { useSeedLayout } from '@/library/useSeedLayout';

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
		getElementAttributes,
		getLayoutClasses,
		generateId,
		generateSeedClass,
		applyCSSVariables,
		createDynamicStyles
	} = useSeedLayout();

	const [attributes, setAttributes] = useState<Record<string, string>>({});
	const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

	useEffect(() => {
		// Generate dynamic attributes and styles based on seed
		const elementAttrs = getElementAttributes('container', index);
		const containerClasses = getLayoutClasses('container');
		const containerId = generateId('dynamic-container', index);
		const seedClass = generateSeedClass('dynamic-container');
		
		setAttributes({
			...elementAttrs,
			id: containerId,
			className: `${containerClasses} ${seedClass} ${className}`.trim()
		});
		
		setDynamicStyles(createDynamicStyles());
	}, [index, className, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

	useEffect(() => {
		// Apply CSS vars to the container element
		if (containerRef.current) {
			applyCSSVariables(containerRef.current);
		}
	}, [dynamicStyles, applyCSSVariables]);

	return (
		<div
			ref={containerRef}
			{...attributes}
			{...rest}
			style={dynamicStyles}
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
		getElementAttributes,
		getLayoutClasses,
		generateId,
		generateSeedClass,
		applyCSSVariables,
		createDynamicStyles
	} = useSeedLayout();

	const [attributes, setAttributes] = useState<Record<string, string>>({});
	const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

	useEffect(() => {
		// Generate dynamic attributes and styles based on seed
		const elementAttrs = getElementAttributes('item', index);
		const itemClasses = getLayoutClasses('item');
		const itemId = generateId('dynamic-item', index);
		const seedClass = generateSeedClass('dynamic-item');
		
		setAttributes({
			...elementAttrs,
			id: itemId,
			className: `${itemClasses} ${seedClass} ${className}`.trim()
		});
		
		setDynamicStyles(createDynamicStyles());
	}, [index, className, getElementAttributes, getLayoutClasses, generateId, generateSeedClass, createDynamicStyles]);

	useEffect(() => {
		// Apply CSS vars to the item element
		if (itemRef.current) {
			applyCSSVariables(itemRef.current);
		}
	}, [dynamicStyles, applyCSSVariables]);

	return (
		<div
			ref={itemRef}
			{...attributes}
			{...rest}
			style={dynamicStyles}
		>
			{children}
		</div>
	);
}
