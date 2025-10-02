import {Box, Text} from 'ink';
import React, {useEffect} from 'react';
import {FileEntry, listFiles} from '../../api/getDirElements.js';
import FileTree, {FileTreeItem, FileTreeProvider} from '../ui/FileTree.js';
import FileDetailsView from '../components/FileNavigator/FileInfo/FileInfo.js';
import {ContentFocusProvider} from '../contexts/ContentFocus.js';

// const dummyFiles = [
// 	{name: '.editorconfig', isDir: false},
// 	{name: '.gitattributes', isDir: false},
// 	{name: '.gitignore', isDir: false},
// 	{name: '.prettierignore', isDir: false},
// 	{name: 'dist', isDir: true},
// 	{name: 'node_modules', isDir: true},
// 	{name: 'package-lock.json', isDir: false},
// 	{name: 'package.json', isDir: false},
// 	{name: 'readme.md', isDir: false},
// 	{name: 'source', isDir: true},
// 	{name: 'test.tsx', isDir: false},
// 	{name: 'tsconfig.json', isDir: false},
// ];

function convertToFileTreeObject(files: FileEntry[]): FileTreeItem[] {
	return files.map(file => ({
		id: file.inodeInfo.ino,
		label: file.name,
		fullPath: file.fullPath,
		children: file.isDir ? [] : null,
		inodeInfo: file.inodeInfo,
	}));
}

const FileNavigator = ({path}: {path: string}) => {
	const [files, setFiles] = React.useState<FileTreeItem[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [hoveredItem, setHoveredItem] = React.useState<FileTreeItem>();

	useEffect(() => {
		async function fetchFiles() {
			const files = await listFiles(path);
			// console.log(files);
			return files;
		}
		setLoading(true);
		fetchFiles()
			.then(data => {
				setFiles(convertToFileTreeObject(data));
				// console.log(data);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);
	if (loading) {
		return <Text>Loading...</Text>;
	}

	async function getChildren(dir: string) {
		const files = await listFiles(dir);
		return convertToFileTreeObject(files);
	}

	return (
		<ContentFocusProvider>
			<Box
				flexDirection="row"
				// gap={7}
				justifyContent="space-between"
				alignItems="flex-start"
			>
				<Box >
					<FileTreeProvider
						onHoverChange={item => {
							setHoveredItem(item);
						}}
						items={files}
					>
						<FileTree items={files} getChildrenFn={getChildren} />
					</FileTreeProvider>
				</Box>
				<Box
					flexGrow={1}
					flexDirection="row"
					alignItems="center"
					justifyContent="center"
				>
					<FileDetailsView fileInfo={hoveredItem} />
				</Box>
			</Box>
		</ContentFocusProvider>
	);
};

export default FileNavigator;
