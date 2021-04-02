const fs = require('fs')
const os = require('os')
const spc = require("./simple-git-hooks");
const path = require("path")

const { packageVersion } = require('./package.json');


// Get project root directory

test('getProjectRootDirectory returns correct dir in typical case:', () => {
    expect(spc.getProjectRootDirectoryFromNodeModules('var/my-project/node_modules/simple-git-hooks')).toBe('var/my-project')
})

test('getProjectRootDirectory returns correct dir when used with windows delimiters:', () => {
    expect(spc.getProjectRootDirectoryFromNodeModules('user\\allProjects\\project\\node_modules\\simple-git-hooks')).toBe('user/allProjects/project')
})

test('getProjectRootDirectory falls back to undefined when we are not in node_modules:', () => {
    expect(spc.getProjectRootDirectoryFromNodeModules('var/my-project/simple-git-hooks')).toBe(undefined)
})

test('getProjectRootDirectory return correct dir when installed using pnpm:', () => {
    expect(spc.getProjectRootDirectoryFromNodeModules(`var/my-project/node_modules/.pnpm/simple-git-hooks@${packageVersion}/node_modules/simple-git-hooks`)).toBe('var/my-project')
})


// Get git root

const gitProjectRoot = path.normalize(path.join(__dirname, '.git'))
const currentPath = path.normalize(path.join(__dirname))
const currentFilePath = path.normalize(path.join(__filename))

test('get git root works from .git directory itself', () => {
    expect(spc.getGitProjectRoot(gitProjectRoot)).toBe(gitProjectRoot)
})

test('get git root works from any directory', () => {
    expect(spc.getGitProjectRoot(currentPath)).toBe(gitProjectRoot)
})

test('get git root works from any file', () => {
    expect(spc.getGitProjectRoot(currentFilePath)).toBe(gitProjectRoot)
})


// Check if simple-pre-commit is in devDependencies or dependencies in package json

const correctPackageJsonProjectPath = path.normalize(path.join(process.cwd(), '_tests', 'project_with_simple_pre_commit_in_deps'))
const correctPackageJsonProjectPath_2 = path.normalize(path.join(process.cwd(), '_tests', 'project_with_simple_pre_commit_in_dev_deps'))
const incorrectPackageJsonProjectPath = path.normalize(path.join(process.cwd(), '_tests', 'project_without_simple_pre_commit'))

test('returns true if simple pre commit really in devDeps', () => {
    expect(spc.checkSimpleGitHooksInDependencies(correctPackageJsonProjectPath)).toBe(true)
})

test('returns true if simple pre commit really in deps', () => {
    expect(spc.checkSimpleGitHooksInDependencies(correctPackageJsonProjectPath_2)).toBe(true)
})

test('returns false if simple pre commit isn`t in deps', () => {
    expect(spc.checkSimpleGitHooksInDependencies(incorrectPackageJsonProjectPath)).toBe(false)
})


// Set and remove git hooks

const testsFolder = path.normalize(path.join(process.cwd(), '_tests'))

// Correct configurations

const projectWithConfigurationInPackageJsonPath = path.normalize(path.join(testsFolder, 'project_with_configuration_in_package_json'))
const projectWithConfigurationInSeparateJsPath = path.normalize(path.join(testsFolder, 'project_with_configuration_in_separate_js'))
const projectWithConfigurationInAlternativeSeparateJsPath = path.normalize(path.join(testsFolder, 'project_with_configuration_in_alternative_separate_js'))
const projectWithConfigurationInSeparateJsonPath = path.normalize(path.join(testsFolder, 'project_with_configuration_in_separate_json'))
const projectWithConfigurationInAlternativeSeparateJsonPath = path.normalize(path.join(testsFolder, 'project_with_configuration_in_alternative_separate_json'))

// Incorrect configurations

const projectWithIncorrectConfigurationInPackageJson = path.normalize(path.join(testsFolder, 'project_with_incorrect_configuration_in_package_json'))
const projectWithoutConfiguration = path.normalize(path.join(testsFolder, 'project_without_configuration'))

/**
 * Creates .git/hooks dir from root
 * @param {string} root
 */
function createGitHooksFolder(root) {
    if (fs.existsSync(root + '/.git')) {
        return
    }
    fs.mkdirSync(root + '/.git')
    fs.mkdirSync(root + '/.git/hooks')
}

/**
 * Removes .git directory from root
 * @param {string} root
 */
function removeGitHooksFolder(root) {
    if (fs.existsSync(root + '/.git')) {
        fs.rmdirSync(root + '/.git', { recursive: true })
    }
}

/**
 * Returns all installed git hooks
 * @return { {string: string} }
 */
function getInstalledGitHooks(hooksDir) {
    const result = {}

    const hooks = fs.readdirSync(hooksDir)

    for (let hook of hooks) {
        result[hook] = fs.readFileSync(path.normalize(path.join(hooksDir, hook))).toString()
    }

    return result
}

test('creates git hooks if configuration is correct from .simple-git-hooks.js', () => {
    createGitHooksFolder(projectWithConfigurationInAlternativeSeparateJsPath)

    spc.setHooksFromConfig(projectWithConfigurationInAlternativeSeparateJsPath)
    const installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInAlternativeSeparateJsPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`, 'pre-push':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInAlternativeSeparateJsPath)
})

test('creates git hooks if configuration is correct from simple-git-hooks.js', () => {
    createGitHooksFolder(projectWithConfigurationInSeparateJsPath)

    spc.setHooksFromConfig(projectWithConfigurationInSeparateJsPath)
    const installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInSeparateJsPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`, 'pre-push':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInSeparateJsPath)
})


test('creates git hooks if configuration is correct from .simple-git-hooks.json', () => {
    createGitHooksFolder(projectWithConfigurationInAlternativeSeparateJsonPath)

    spc.setHooksFromConfig(projectWithConfigurationInAlternativeSeparateJsonPath)
    const installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInAlternativeSeparateJsonPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`, 'pre-push':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInAlternativeSeparateJsonPath)
})

test('creates git hooks if configuration is correct from simple-git-hooks.json', () => {
    createGitHooksFolder(projectWithConfigurationInSeparateJsonPath)

    spc.setHooksFromConfig(projectWithConfigurationInSeparateJsonPath)
    const installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInSeparateJsonPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`, 'pre-push':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInSeparateJsonPath)
})

test('creates git hooks if configuration is correct from package.json', () => {
    createGitHooksFolder(projectWithConfigurationInPackageJsonPath)

    spc.setHooksFromConfig(projectWithConfigurationInPackageJsonPath)
    const installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInPackageJsonPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInPackageJsonPath)
})

test('fails to create git hooks if configuration contains bad git hooks', () => {
    createGitHooksFolder(projectWithIncorrectConfigurationInPackageJson)

    expect(() => spc.setHooksFromConfig(projectWithIncorrectConfigurationInPackageJson)).toThrow('[ERROR] Config was not in correct format. Please check git hooks name')

    removeGitHooksFolder(projectWithIncorrectConfigurationInPackageJson)
})

test('fails to create git hooks if not configured', () => {
    createGitHooksFolder(projectWithoutConfiguration)

    expect(() => spc.setHooksFromConfig(projectWithoutConfiguration)).toThrow('[ERROR] Config was not found! Please add `.simple-git-hooks.js` or `simple-git-hooks.js` or `.simple-git-hooks.json` or `simple-git-hooks.json` or `simple-git-hooks` entry in package.json.')

    removeGitHooksFolder(projectWithoutConfiguration)
})

test('removes git hooks', () => {
    createGitHooksFolder(projectWithConfigurationInPackageJsonPath)

    spc.setHooksFromConfig(projectWithConfigurationInPackageJsonPath)

    let installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInPackageJsonPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`}))

    spc.removeHooks(projectWithConfigurationInPackageJsonPath)

    installedHooks = getInstalledGitHooks(path.normalize(path.join(projectWithConfigurationInPackageJsonPath, '.git', 'hooks')))
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({}))

    removeGitHooksFolder(projectWithConfigurationInPackageJsonPath)
})

test('creates git hooks and removes unused git hooks', () => {
    createGitHooksFolder(projectWithConfigurationInPackageJsonPath)

    const installedHooksDir = path.normalize(path.join(projectWithConfigurationInPackageJsonPath, '.git', 'hooks'))

    fs.writeFileSync(path.resolve(installedHooksDir, 'pre-push'), "# do nothing")

    let installedHooks = getInstalledGitHooks(installedHooksDir);
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-push':'# do nothing'}))

    spc.setHooksFromConfig(projectWithConfigurationInPackageJsonPath)

    installedHooks = getInstalledGitHooks(installedHooksDir);
    expect(JSON.stringify(installedHooks)).toBe(JSON.stringify({'pre-commit':`#!/bin/sh${os.EOL}exit 1`}))

    removeGitHooksFolder(projectWithConfigurationInPackageJsonPath)
})
