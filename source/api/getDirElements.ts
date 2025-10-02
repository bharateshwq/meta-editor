import * as fs from 'fs';
import * as path from 'path';

export type FileEntry = {
	name: string;
	fullPath: string;
	isDir: boolean;
	inodeInfo: fs.Stats;
};

export async function listFiles(
	dir: string = process.cwd(),
): Promise<FileEntry[]> {
	const entries = await fs.promises.readdir(dir, {withFileTypes: true});

	// Collect all stats and prepare basic entries
	const rawEntries = await Promise.all(
		entries.map(async entry => {
			const fullPath = path.join(dir, entry.name);
			const stats = await fs.promises.lstat(fullPath);
			return {
				name: entry.name,
				fullPath,
				isDir: entry.isDirectory(),
				inodeInfo: stats,
			};
		}),
	);

	return rawEntries;
}
