import React, {createContext, useContext, useState, ReactNode} from 'react';

// Define the shape of the context
export type ContentFocusType =
	| 'explorer'
	| 'file_information'
	| 'permission_ownership'
	| 'storage_details'
	| 'timestamps';

interface ContentFocusContextType {
	contentFocus: ContentFocusType;
	setContentFocus: React.Dispatch<React.SetStateAction<ContentFocusType>>;
}

// Create the context
const ContentFocusContext = createContext<ContentFocusContextType>({
	contentFocus: 'explorer',
	setContentFocus: () => {},
});

// Provider props type
interface ContentFocusProviderProps {
	children: ReactNode;
}

export function ContentFocusProvider({children}: ContentFocusProviderProps) {
	const [contentFocus, setContentFocus] =
		useState<ContentFocusType>('explorer');

	return (
		<ContentFocusContext.Provider value={{contentFocus, setContentFocus}}>
			{children}
		</ContentFocusContext.Provider>
	);
}

// Custom hook to use the context
export const useContentFocus = (): ContentFocusContextType => {
	const context = useContext(ContentFocusContext);
	if (context === undefined) {
		throw new Error(
			'useContentFocus must be used within a ContentFocusProvider',
		);
	}
	return context;
};
