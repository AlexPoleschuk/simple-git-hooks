# simple-pre-commit

A simple tool, that let you set command from `package.json` as a pre-commit hook

## Why?

- Lightweight
- Easy to install
- Dead simple to use

## Usage:

1. Install the simple-pre-commit as dev dependency `npm install simple-pre-commit --dev`

2. Add the `simple-pre-commit` to your `package.json`. Feed it with any command you would like to run as a pre-commit hook. 
   
   `"simple-pre-commit":"npx lint-staged"`

3. Run the CLI script to update the git hook with command from `package.json`

    `npx simple-pre-commit`
    
Now the command from `package.json` is set up as executable git pre-commit hook. 
You can look up about git hooks [here](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)

> You should run `npx simple-pre-commit` manually on every change of the command

