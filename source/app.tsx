import React from 'react';
import AppLayout from './App/layouts/AppLayout.js';
import FileNavigator from './App/pages/FileNavigator.js';

const App = ({path}: {path: string}) => {
	return (
		<AppLayout>
			<FileNavigator path={path} />
		</AppLayout>
	);
};

export default App;
