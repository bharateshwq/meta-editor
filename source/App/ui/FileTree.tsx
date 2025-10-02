import {Box, Text, useFocus, useFocusManager, useInput} from 'ink';
import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useContext,
	useEffect,
	useMemo,
	useRef,
	// useRef,
	useState,
} from 'react';
import * as fs from 'fs';
import {useContentFocus} from '../contexts/ContentFocus.js';

export type FileTreeItem = {
	id: string | number;
	label: string;
	children: FileTreeItem[] | null;
	fullPath: string;
	inodeInfo: fs.Stats;
};

type getChildrenFn = (dir: string) => Promise<FileTreeItem[]>;

type FileTreeProps = {
	items: FileTreeItem[];
	getChildrenFn?: getChildrenFn;
};
type FileTreeHoveredProviderProps = {
	onHoverChange: (item: FileTreeItem) => void;
	items: FileTreeItem[];
	children: React.ReactNode;
};
type FileTreeHoveredProviderValueType = {
	rawItems: FileTreeItem[];
	setRawItems: Dispatch<SetStateAction<FileTreeItem[]>>;
};

const FileTreeHoveredContext = createContext<FileTreeHoveredProviderValueType>({
	rawItems: [],
	setRawItems: () => {},
});

const flattenItemsRecursive = (items: FileTreeItem[]): FileTreeItem[] => {
	return items.flatMap(item => {
		if (Array.isArray(item.children) && item.children.length > 0) {
			return [item, ...flattenItemsRecursive(item.children)];
		}
		return [item];
	});
};
export type FileTreeHandle = {
	getHoveredItem: () => FileTreeItem | undefined;
};

export function FileTreeProvider({
	children,
	items,
	onHoverChange,
}: FileTreeHoveredProviderProps) {
	const [rawItems, setRawItems] = useState<FileTreeItem[]>(items);
	const {focus} = useFocusManager();
	const hoveredIndex = useRef(0);
	const {contentFocus, setContentFocus} = useContentFocus();
	const isFileTreeFocused = 'explorer' === contentFocus;

	const flattenedItems = useMemo(
		() => flattenItemsRecursive(rawItems),
		[rawItems],
	);

	function onFocusChange(item: FileTreeItem) {
		onHoverChange(item);
	}

	useInput((input, key) => {
		if (key.meta) {
			switch (input.toLowerCase()) {
				case 'f':
					setContentFocus('file_information');
					break;
				case 'p':
					setContentFocus('permission_ownership');
					break;
				case 's':
					setContentFocus('storage_details');
					break;
				case 't':
					setContentFocus('timestamps');
					break;
			}
			return;
		} else if (key.return) {
			setContentFocus('file_information');
			return;
		}
		if (!isFileTreeFocused) return;

		if (key.downArrow || input === 'j') {
			hoveredIndex.current = (hoveredIndex.current + 1) % flattenedItems.length;
		} else if (key.upArrow || input === 'k') {
			hoveredIndex.current =
				(hoveredIndex.current - 1 + flattenedItems.length) %
				flattenedItems.length;
		}
		const nextFocusableElement = flattenedItems[hoveredIndex.current];
		if (nextFocusableElement) {
			onFocusChange(nextFocusableElement);
			focus(String(nextFocusableElement.id));
		}
	});
	// const {contentFocus} = useContentFocus();
	// const isFileTreeFocused = contentFocus === 'explorer';

	return (
		<FileTreeHoveredContext.Provider value={{rawItems, setRawItems}}>
			<Box
				overflowY="visible"
				height={26}
				paddingRight={5}
				flexDirection="column"
				flexGrow={1}
				borderStyle="single"
				borderColor={isFileTreeFocused ? 'green' : undefined}
			>
				{children}
			</Box>
		</FileTreeHoveredContext.Provider>
	);
}

export function useHover() {
	const context = useContext(FileTreeHoveredContext);
	if (context === undefined) {
		throw new Error('Please use useHover inside FileTreeProved');
	}
	return context;
}

const FileTree = ({items, getChildrenFn}: FileTreeProps) => {
	const slicedItems = items.slice(0, 50);
	return slicedItems.map(item => (
		<FileTreeItemComponent
			key={item.id}
			getChildrenFn={getChildrenFn}
			item={item}
		/>
	));
};

const updateItemChildrenById = (
	items: FileTreeItem[],
	targetId: string | number,
	newChildren: FileTreeItem[],
): FileTreeItem[] => {
	return items.map(item => {
		if (item.id === targetId) {
			return {
				...item,
				children: newChildren,
			};
		}

		if (item.children) {
			return {
				...item,
				children: updateItemChildrenById(item.children, targetId, newChildren),
			};
		}

		return item;
	});
};

const FileTreeItemComponent = ({
	item,
	getChildrenFn,
}: {
	item: FileTreeItem;

	getChildrenFn?: getChildrenFn;
}) => {
	const isDir: boolean = item.children !== null;

	const [items, setItems] = useState<FileTreeItem[]>(item.children || []);
	const [showChildren, setShowChildren] = useState(false);
	const {contentFocus} = useContentFocus();
	const isFileTreeFocused = 'explorer' === contentFocus;

	const {setRawItems} = useHover();

	const {isFocused: hovered} = useFocus({
		id: String(item.inodeInfo.ino),
		autoFocus: true,
	});
	// console.log('rerendered item', item.id, hovered);

	useEffect(() => {
		if (typeof getChildrenFn === 'function' && isDir && showChildren) {
			getChildrenFn(item.fullPath).then(children => {
				setItems(children);
				setRawItems(prevItems =>
					updateItemChildrenById(prevItems, item.id, children),
				);

				// item.children = children;
			});
		}
		return () => {
			setItems([]);
			setRawItems(prevItems => updateItemChildrenById(prevItems, item.id, []));
		};
	}, [showChildren]);

	useInput(
		(input, key) => {
			if (!isFileTreeFocused) return;
			if ((key.return || input === 'l') && isDir) {
				setShowChildren(prev => !prev);
			} else if (input === 'h' && showChildren) {
				setShowChildren(false);
			}
		},
		{
			isActive: hovered && item.children !== null,
		},
	);

	return (
		<Box
			flexDirection="column"
			marginLeft={3} // indentation
		>
			<Box
				// borderStyle="single"
				flexDirection="row"
				alignItems="center"
				justifyContent="flex-start"
				paddingX={1}
				height={2}
                gap={1}
			>
				<Text>{isDir ? (showChildren ? '📂' : '📁') : '📄'}</Text>
				<Text
					italic={!isFileTreeFocused && hovered}
					bold={hovered && !isFileTreeFocused}
					underline={!isFileTreeFocused && hovered}
					color={hovered ? 'green' : undefined}
				>
					{item.label}
				</Text>
			</Box>
			{showChildren && (
				<Box flexDirection="column">
					<FileTree items={items} getChildrenFn={getChildrenFn} />
				</Box>
			)}
		</Box>
	);
};

export default FileTree;
