import {Box} from 'ink';
import React from 'react';
import PageTitleProvider from '../contexts/PageTitle.js';
// import PageTitle from '../components/AppLayouts/PageTitle.js';
import Navigator from '../contexts/Navigator.js';
import PageTitle from '../components/AppLayouts/PageTitle.js';

type AppLayoutProps = {
	children: React.ReactNode;
};

const AppLayout = ({children}: AppLayoutProps) => {
	return (
		<Navigator>
			<PageTitleProvider>
				<PageTitle />
				<Box flexDirection="column" minHeight="100" padding={1} gap={1}>
					{children}
				</Box>
			</PageTitleProvider>
		</Navigator>
	);
};

export default AppLayout;
