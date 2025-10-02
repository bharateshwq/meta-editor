import {Box, Text, useFocus, useFocusManager, useInput} from 'ink';
import React, {useEffect, useRef, useState} from 'react';

type ButtonProps = {
	// variant?: "icon" | "default" | "outlined"
	onClick?: () => void;
	children: React.ReactNode | string;
	disabled?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
};

const Button = ({
	onFocus,
	onBlur,
	onClick,
	children,
	disabled = false,
}: ButtonProps) => {
	const [isPressed, setIsPressed] = useState(false);
	const wasFocused = useRef(false);
	const {focusNext} = useFocusManager();
	const {isFocused: rawFocus} = useFocus({isActive: !disabled});
	const isFocused = !disabled && rawFocus;
	useEffect(() => {
		// console.log(isFocused, disabled);
		if (disabled) return;
		if (isFocused) {
			onFocus?.();
			wasFocused.current = true;
		}
		if (wasFocused.current && !isFocused) {
			onBlur?.();
			wasFocused.current = false;
		}
	}, [isFocused]);

	useEffect(() => {
		if (rawFocus && disabled) {
			focusNext();
		}
	}, [rawFocus]);

	useInput((_, key) => {
		if (disabled) return;
		if (isFocused && key.return) {
			setIsPressed(true);
			onClick?.();
			setTimeout(() => {
				setIsPressed(false);
			}, 200);
		}
	});

	return (
		<Box
			aria-role="button"
			aria-state={{
				disabled: disabled,
			}}
			borderDimColor={disabled}
			borderStyle={isFocused ? (isPressed ? 'classic' : 'double') : 'round'}
			borderColor={isFocused ? (isPressed ? 'cyanBright' : 'cyan') : 'gray'}
			height={3}
			paddingX={1}
		>
			{typeof children === 'string' ? <Text>{children}</Text> : children}
		</Box>
	);
};

export default Button;
