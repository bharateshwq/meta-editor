import React, {createContext} from 'react';

type PageTitleContextType = {
	pageTitle: string;
	setPageTitle: React.Dispatch<React.SetStateAction<string>>;
};

const PageTitleContext = createContext<PageTitleContextType>({
	pageTitle: '',
	setPageTitle: () => {},
});

const PageTitleProvider = ({children}: {children: React.ReactNode}) => {
	const [pageTitle, setPageTitle] = React.useState<string>('');
	return (
		<PageTitleContext.Provider value={{pageTitle, setPageTitle}}>
			{children}
		</PageTitleContext.Provider>
	);
};

function usePageTitle() {
	const context = React.useContext(PageTitleContext);
	if (context === undefined) {
		throw new Error('usePageTitle must be used within a PageTitleProvider');
	}
	return context;
}

export {usePageTitle};

export default PageTitleProvider;
