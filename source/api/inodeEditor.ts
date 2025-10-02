import * as fs from 'fs';

/**
 * Change file permissions (e.g. 0o644 for rw-r--r--)
 * @param filePath Path to the file
 * @param mode File mode (e.g., 0o755)
 */
export async function changePermissions(
	filePath: string,
	mode: number,
): Promise<void> {
	await fs.promises.chmod(filePath, mode);
}

/**
 * Change file ownership (UID and GID)
 * @param filePath Path to the file
 * @param uid User ID
 * @param gid Group ID
 */
export async function changeOwnership(
	filePath: string,
	uid: number,
	gid: number,
): Promise<void> {
	await fs.promises.chown(filePath, uid, gid);
}

/**
 * Update access and modification timestamps
 * @param filePath Path to the file
 * @param atime Access time (Date or number)
 * @param mtime Modification time (Date or number)
 */
export async function updateTimestamps(
	filePath: string,
	atime: number | Date,
	mtime: number | Date,
): Promise<void> {
	await fs.promises.utimes(filePath, atime, mtime);
}
