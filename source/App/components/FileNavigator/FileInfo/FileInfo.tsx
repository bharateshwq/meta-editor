import React, {useEffect, useRef, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {FileTreeItem} from '../../../ui/FileTree.js';
import * as fs from 'fs';
import {
	ContentFocusType,
	useContentFocus,
} from '../../../contexts/ContentFocus.js';

export const LabelValue = ({
	label,
	value,
	inFocus = false,
}: {
	label: string;
	value: string | number;
	inFocus?: boolean;
}) => {
	const focusIndicator = inFocus ? '▶' : '';
	const labelColor = inFocus ? 'cyanBright' : 'cyan';
	const paddingValue = inFocus ? 12 : 13;
	const labelStyle = {
		bold: inFocus,
		underline: inFocus,
	};

	return (
		<Text wrap="truncate-end">
			<Text color={labelColor} {...labelStyle}>
				{focusIndicator} {label.padEnd(paddingValue)}:{' '}
				<Text color={inFocus ? 'whiteBright' : 'white'}>{String(value)}</Text>
			</Text>
		</Text>
	);
};

export const Panel = ({
	title,
	active,
	keyBindingLabel,
	children,
}: {
	title: string;
	keyBindingLabel: string;
	children: React.ReactNode;
	active?: boolean;
}) => {
	const [metaPressed, setMetaPressed] = useState(false);
	const metaTimeout = useRef<NodeJS.Timeout | null>(null);

	useInput((input, key) => {
		if (
			key.meta &&
			!(
				input === 'f' ||
				input === 'p' ||
				input === 's' ||
				input === 't' ||
				input === 'e'
			)
		) {
			setMetaPressed(true);

			if (metaTimeout.current) clearTimeout(metaTimeout.current);
			metaTimeout.current = setTimeout(() => {
				setMetaPressed(false);
				metaTimeout.current = null;
			}, 1000);
		}
	});

	useEffect(() => {
		return () => {
			if (metaTimeout.current) {
				clearTimeout(metaTimeout.current);
				metaTimeout.current = null;
			}
		};
	}, []);

	const displayTitle = metaPressed ? `${title} ${keyBindingLabel}` : title;

	return (
		<Box flexDirection="column" marginBottom={1} minWidth={35}>
			<Text bold>{displayTitle}</Text>
			<Box
				borderStyle="round"
				paddingX={1}
				flexDirection="column"
				height={7}
				width={48}
				borderColor={active ? 'green' : 'gray'}
				justifyContent="flex-start"
				alignItems="flex-start"
			>
				{children}
			</Box>
		</Box>
	);
};

function getFileType(stats: fs.Stats): string {
	if (stats.isDirectory()) return 'Directory';
	if (stats.isFile()) return stats.nlink > 1 ? 'Hardlink' : 'File';
	if (stats.isSymbolicLink()) return 'Symlink';
	if (stats.isBlockDevice()) return 'Block Device';
	if (stats.isCharacterDevice()) return 'Character Device';
	if (stats.isFIFO()) return 'FIFO (Named Pipe)';
	if (stats.isSocket()) return 'Socket';
	return 'Unknown';
}

export interface InfoItem {
	id: string;
	label: string;
	value: string | number;
}

interface FocusableInfoSectionProps {
	items: InfoItem[];
	sectionId: ContentFocusType; // e.g. 'metatdata_section'
	sectionTitle: string; // e.g. 'FILE INFORMATION [Alt+F]'
	sectionShortcutLabel: string;
}

const FocusableInfoSection: React.FC<FocusableInfoSectionProps> = ({
	items,
	sectionId,
	sectionTitle,
	sectionShortcutLabel,
}) => {
	const hoverIndex = React.useRef(0);
	const {contentFocus, setContentFocus} = useContentFocus();
	const isSectionFocused = contentFocus === sectionId;
	const [selectedItemId, setSelectedItemId] = React.useState(
		items[0]?.id ?? '',
	);

	// Handle input
	useInput((input, key) => {
		// Track meta key for showing shortcut

		if (!isSectionFocused) return;

		if (input === 'e' && key.meta) {
			setContentFocus('explorer');
		} else if (items.length > 0) {
			if (input === 'j' || key.downArrow) {
				hoverIndex.current = (hoverIndex.current + 1) % items.length;
			} else if (input === 'k' || key.upArrow) {
				hoverIndex.current =
					(hoverIndex.current - 1 + items.length) % items.length;
			}
			setSelectedItemId(items[hoverIndex.current]!.id);
		}
	});

	if (items.length === 0) return null;

	return (
		<Panel
			active={isSectionFocused}
			title={sectionTitle}
			keyBindingLabel={sectionShortcutLabel}
		>
			{items.map(({id, label, value}) => (
				<LabelValue
					key={id}
					inFocus={isSectionFocused && selectedItemId === id}
					label={label}
					value={value}
				/>
			))}
		</Panel>
	);
};

const FileDetailsView: React.FC<{fileInfo: FileTreeItem | undefined}> = ({
	fileInfo,
}) => {
	if (!fileInfo) {
		return (
			<Box
				flexDirection="column"
				padding={1}
				borderStyle="double"
				borderColor="cyan"
			>
				<Text italic color="gray">
					Hover over a file or directory to see its details here.
				</Text>
			</Box>
		);
	}

	const {inodeInfo} = fileInfo;

	const infoItems: InfoItem[] = [
		{id: 'name', label: 'Name', value: fileInfo.label},
		{id: 'type', label: 'Type', value: getFileType(inodeInfo)},
		{id: 'inode', label: 'Inode', value: inodeInfo.ino},
	];

	const permissionsItems: InfoItem[] = [
		{id: 'mode', label: 'Mode', value: inodeInfo.mode},
		{id: 'uid', label: 'UID', value: inodeInfo.uid},
		{id: 'gid', label: 'GID', value: inodeInfo.gid},
		{id: 'nlink', label: 'Links', value: inodeInfo.nlink},
	];

	const storageItems: InfoItem[] = [
		{id: 'size', label: 'Size', value: `${inodeInfo.size} bytes`},
		{id: 'blocks', label: 'Blocks', value: inodeInfo.blocks},
		{id: 'blksize', label: 'Block Size', value: `${inodeInfo.blksize} bytes`},
		{id: 'dev', label: 'Device', value: inodeInfo.dev},
		{id: 'rdev', label: 'Rdev', value: inodeInfo.rdev},
	];

	const timestampItems: InfoItem[] = [
		{id: 'atime', label: 'Accessed', value: inodeInfo.atime.toLocaleString()},
		{id: 'mtime', label: 'Modified', value: inodeInfo.mtime.toLocaleString()},
		{id: 'ctime', label: 'Changed', value: inodeInfo.ctime.toLocaleString()},
		{
			id: 'birthtime',
			label: 'Created',
			value: inodeInfo.birthtime.toLocaleString(),
		},
	];

	return (
		<Box
			flexDirection="column"
			padding={1}
			height={26}
			borderStyle="round"
			borderColor="cyan"
		>
			<Text bold color="green">
				{fileInfo.label} : Metadata
			</Text>
			<Text bold color="grey">
				Full Path : {fileInfo.fullPath}
			</Text>

			<Box marginY={1} />

			{/* First row */}
			<Box flexWrap="wrap" rowGap={0} columnGap={1} width={100}>
				<FocusableInfoSection
					items={infoItems}
					sectionId="file_information"
					sectionTitle="FILE INFORMATION"
					sectionShortcutLabel="[Alt+F]"
				/>

				<FocusableInfoSection
					items={permissionsItems}
					sectionId="permission_ownership"
					sectionTitle="PERMISSIONS & OWNERSHIP"
					sectionShortcutLabel="[Alt+P]"
				/>
			</Box>

			{/* Second row */}
			<Box flexWrap="wrap" rowGap={0} columnGap={1} width={100}>
				<FocusableInfoSection
					items={storageItems}
					sectionId="storage_details"
					sectionTitle="STORAGE DETAILS"
					sectionShortcutLabel="[Alt+S]"
				/>

				<FocusableInfoSection
					items={timestampItems}
					sectionId="timestamps"
					sectionTitle="TIMESTAMPS"
					sectionShortcutLabel="[Alt+T]"
				/>
			</Box>
		</Box>
	);
};

export default FileDetailsView;
