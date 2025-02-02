#!/usr/bin/env node
// @ts-check

import { argv, exit } from 'node:process';
import { execSync } from 'node:child_process';

// ANSI color codes
const YELLOW = '\x1b[33m';
const NC = '\x1b[0m';

// Configurable prefix for tickets. And by configurable, I mean change this value in the code.
const ticketPrefix = 'DX-';

/**
 * Print a warning to the console, and exit with a status code of 0.
 * This hook is meant to be a guardrail, rather than a blocker for making commits.
 * @param {string} message a message to print to the screen in addition to a default one explaining the exit
 */
const printWarningAndExitOk = (message) => {
    if (message) {
        console.error(`${YELLOW}WARNING: ${message}${NC}`);
    }
    console.error(`${YELLOW}commit-msg hook is exiting with exit code 0 to not block the commit.${NC}`);
    exit(0);
};

try {
    const commitMsgFile = argv[2];
    if (!commitMsgFile) {
        printWarningAndExitOk('Unable to determine git commit message file.');
    }
    
    const currentBranch = execSync('git symbolic-ref --short HEAD', { encoding: 'utf8' }).trim();
    const pattern = new RegExp(`^${ticketPrefix}(\\d+).*`, 'i');
    const match = currentBranch.match(pattern);
    const capturedText = match?.[1];
    if (!capturedText) {
        printWarningAndExitOk(`Your branch needs to start with ${ticketPrefix}XXXX, found '${currentBranch}'`);
    }

    const trailer = `${ticketPrefix}${capturedText}`;
    execSync(`git interpret-trailers --in-place --trailer "Ticket:${trailer}" "${commitMsgFile}"`);
} catch (error) {
    if (error instanceof Error) {
        printWarningAndExitOk(`Error in commit-msg hook: ${error.message}`);
    } else {
        printWarningAndExitOk(`Unknown error in commit-msg hook ${error}`);
    }
}
exit(0);
