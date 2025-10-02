import React, {createContext, useContext, useState, useTransition} from 'react';
import ROUTES from '../route-config.js';

type Route = (typeof ROUTES)[keyof typeof ROUTES];

type NavigatorContextType = {
	location: Route;
	navigate: (path: Route) => void;
	isPending: boolean;
};

const NavigatorContext = createContext<NavigatorContextType>({
	location: ROUTES.FILE_NAVIGATOR,
	navigate: () => {},
	isPending: false,
});

const Navigator = ({children}: {children: React.ReactNode}) => {
	const [presentRoute, setPresentRoute] = useState<Route>(ROUTES.FILE_NAVIGATOR);
	const [isPending, startTranstion] = useTransition();
	function navigate(path: Route) {
		startTranstion(() => {
			setPresentRoute(path);
		});
	}
	return (
		<NavigatorContext.Provider
			value={{location: presentRoute, navigate, isPending}}
		>
			{children}
		</NavigatorContext.Provider>
	);
};

function useNavigator() {
	const context = useContext(NavigatorContext);
	if (context === undefined) {
		throw new Error('useNavigator must be used within a NavigatorProvider');
	}
	return context;
}

export {useNavigator};

export default Navigator;
