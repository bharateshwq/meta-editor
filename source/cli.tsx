#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import App from './app.js';
import meow from 'meow';

const cli = meow(
	`
    Usage
	  $ inode-editor <input>

	Options
	  --path, -p  Refer a path

	Examples
	  $ inode-editor --path ./
    
    

    `,
	{
		importMeta: import.meta,
		flags: {
			path: {
				type: 'string',
				shortFlag: 'p',
			},
		},
	},
);
const path = cli.flags.path ?? process.cwd();
render(<App path={path} />);
