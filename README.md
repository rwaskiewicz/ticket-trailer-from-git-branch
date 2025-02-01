# Tickety Cricket

This repo contains a `commit-msg` hook for finding a string at the beginning of a git branch name and placing it in a git trailer.

## What It Does

For a git branch with the name `dx-1111/feat/add-cool-thing`, this hook parses the branch name, and adds the ticket value to the git message as a trailer.

```bash
$ git checkout -b dx-1111/feat/add-cool-thing
$ echo "Hello World" > README.md
$ git add README.md
$ git commit -m 'Add Hello World README'
$ git log HEAD

    Add Hello World README

    Ticket: DX-1111
```

## Goals

1. Adding ticketing info to commit messages with minimal friction
2. This hook shall never stop a commit from occurring
3. Minimal configuration. It's meant to be forked, checked into your repo, and modified to fit your needs.

## Installation

This hook requires bash and Node to be installed locally.

### MacOS, Linux

Copy `commit-msg` and `commit-msg.mjs` to a git repository you wish to run these hooks in and give the executable permissions:
```bash
$ cp commit-msg commit-msg.mjs /path/to/repo/.git/hooks/
$ chmod +x commit-msg commit-msg.mjs
```

## Limitations

This hook assumes that tickets are of the format PREFIX + NUMERICS - e.g. `RAD-1000`, `MT0001`, `DX-1`.
The default prefix is `DX-`.
If you wish for different behavior, fork and modify this script.