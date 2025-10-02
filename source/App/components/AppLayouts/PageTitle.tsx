import {Box, Text} from 'ink';
import React from 'react';
import {usePageTitle} from '../../contexts/PageTitle.js';
import ROUTES from '../../route-config.js';
import {useNavigator} from '../../contexts/Navigator.js';

const PageTitle = () => {
	const {pageTitle} = usePageTitle();
	const {location} = useNavigator();

	const defaultPageTitle = (() => {
		switch (location) {
			case ROUTES.FILE_NAVIGATOR:
				return 'File Navigator';
			default:
				return 'Inode Editor';
		}
	})();
	const pageTitleExists = pageTitle.trim().length > 0;
	return (
		<Box
			paddingX={3}
			// height={4}
			alignItems="center"
			justifyContent="flex-start"
			borderStyle="round"
		>
			<Box marginY={1}>
				<Text>{pageTitleExists ? pageTitle : defaultPageTitle}</Text>
			</Box>
		</Box>
	);
};

export default PageTitle;
