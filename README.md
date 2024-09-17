# Directory Recreate Action

This GitHub Action removes and re-creates a directory including all files and sub-directories within.

## Table of Contents

- [Installation](#Installation)
- [Usage](#Usage)
- [Building](#Building)
- [Contributing](#contributing)
- [Compiling](#compiling)
- [Releasing](#releasing)

## Installation

To install the dependencies, run:
```shell
npm install
```

## Usage
This action is available to the enterprise organization DSB and every repository within that organization

To use this action in your GitHub workflow, add the following to your `.github/workflows/main.yml:`

```yaml
name: Directory Recreate

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Directory Recreate
        uses: ./
        with:
          directory: 'path/to/directory'
          recreate: true
```

## Building
Since this action is written using TypeScript, it needs to be compiled before it can be used in a workflow. To compile the action, run:
```shell
npm run package
```

The resulting compiled javascript then is found the `dist` directory.

## Contributing

### Development
Do your work, update the tests and make sure that everything lints using the shorthand
```shell
npm run all
```

 - Note that this will (should) also run on a normal `git commit` since the `pre-commit` hook is set up to run the tests and linting as well as compiling the typescript code with all its dependencies

Correct steps to make sure the code is pre-built and linted before committing:

```shell
# stage all your changes (Important since this triggers the git hook)
git add .

#commit your changes
git commit -m "your fancy commit message"
# this should run the tests, linting and compile the typescript code in the console and add the results to the commited files. 
# Check the output for errors

# push your changes
git push

```

Some IDEs might not support the `pre-commit` hook, so make sure to run the tests and linting before pushing your changes in case your chosen IDE does not trigger the `pre-commit` hook.

### Release

After merge to main use tags to release.

#### Minor release

Ex. for smaller backwards compatible changes. Add a new minor version tag ex `v2.1` with a description of the changes and amend the description to the major version tag.

Example for release `v1.1`:
```shell
git checkout origin/main
git pull origin main
# review latest release tag to determine which is the next one
git tag --sort=-creatordate | head -n 5
# output changes since last release
git log v1..HEAD --pretty=format:"%s"
git tag -a 'v1.1'
# you are prompted for the tag annotation (change description)
git tag -f -a 'v1'
# you are prompted for the tag annotation, amend the change description
git push -f origin 'refs/tags/v1.1'
git push -f origin 'refs/tags/v1'
```

**Note:** If you are having problems pulling main after a release, try to force fetch the tags: `git fetch --tags -f`.

#### Major release

Same as minor release except that the major version tag is a new one. I.e. we do not need to force tag/push.

Example for release `v2`:
```shell
git checkout origin/main
git pull origin main
# review latest release tag to determine which is the next one
git tag --sort=-creatordate | head -n 5
# output changes since last release
git log v2..HEAD --pretty=format:"%s"
git tag -a 'v2.0'
# you are prompted for the tag annotation (change description)
git tag -a 'v2'
# you are prompted for the tag annotation
git push -f origin 'refs/tags/v2.0'
git push -f origin 'refs/tags/v2'
```

**Note:** If you are having problems pulling main after a release, try to force fetch the tags: `git fetch --tags -f`.


#### Un-release (move major tag back)

In case of trouble where a fix takes long time to develop, this is how to rollback the major tag to the previous minor release.

Example un-release `v2.9` and revert to `v2.8`:
```shell
git checkout origin/main
git pull origin main

moveTag='v2'
moveToTag='v2.8'
moveToHash=$(git rev-parse --verify ${moveToTag})

git push origin "refs/tags/${moveTag}"      # delete the old tag remotely
git tag -fa ${moveTag} ${moveToHash}        # move tag locally
git push -f origin "refs/tags/${moveTag}"   # push the updated tag remotely

```

**Note:** If you are having problems pulling main after a release, try to force fetch the tags: `git fetch --tags -f`.

