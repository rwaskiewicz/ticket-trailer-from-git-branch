#!/usr/bin/env node
// @ts-check

import { argv, exit } from 'node:process';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

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

/**
 * Try to get the ticket number from the branch name.
 *
 * Getting the ticket number from the branch name may fail when in an interactive rebase, particularly when rewording a
 * commit. The git branch will enter a detached HEAD state, causing `git symbolic-ref` to fail.
 *
 * @returns {string|null} The ticket number or null if not found
 */
const getTicketFromBranch = () => {
    try {
        const currentBranch = execSync('git symbolic-ref --short HEAD', { encoding: 'utf8' }).trim();
        const pattern = new RegExp(`^${ticketPrefix}(\\d+).*`, 'i');
        const match = currentBranch.match(pattern);
        return match?.[1] ?? null;
    } catch {
        return null;
    }
};

/**
 * Try to get the ticket number from existing commit message
 * @param {string} commitMsg - The commit message content
 * @returns {string|null} The ticket number or null if not found
 */
const getTicketFromMessage = (commitMsg) => {
    const ticketPattern = new RegExp(`${ticketPrefix}(\\d+)`, 'gi');
    const trailerPattern = new RegExp(`^Ticket: ${ticketPrefix}(\\d+)`, 'gim');

    // First check for trailers and take the last one if found
    const trailerMatches = Array.from(commitMsg.matchAll(trailerPattern));
    if (trailerMatches.length > 0) {
        return trailerMatches[trailerMatches.length - 1][1];
    }

    // If no trailer, find all ticket mentions and take the last one
    const matches = Array.from(commitMsg.matchAll(ticketPattern));
    if (matches.length > 0) {
        return matches[matches.length - 1][1];
    }

    return null;
};

try {
    const commitMsgFile = argv[2];
    if (!commitMsgFile) {
        printWarningAndExitOk('Unable to determine git commit message file.');
    }

    let ticketNumber = getTicketFromBranch() ?? getTicketFromMessage(readFileSync(commitMsgFile, 'utf8'));
    if (!ticketNumber) {
        printWarningAndExitOk(`No ticket number found in branch name or commit message (expected format: ${ticketPrefix}[NUMBER])`);
    }

    const trailer = `${ticketPrefix}${ticketNumber}`;
    execSync(`git interpret-trailers --in-place --trailer "Ticket:${trailer}" "${commitMsgFile}"`);
} catch (error) {
    if (error instanceof Error) {
        printWarningAndExitOk(`Error in commit-msg hook: ${error.message}`);
    } else {
        printWarningAndExitOk(`Unknown error in commit-msg hook ${error}`);
    }
}
exit(0);
