import * as core from '@actions/core'
import * as fs from 'fs'

/**
 * Main function to run the cleanup and optional recreation of a directory.
 *
 * This function performs the following steps:
 * 1. Retrieves the directory path and recreate flag from inputs or environment variables.
 * 2. Lists the contents of the directory before cleanup.
 * 3. Deletes the directory if it exists.
 * 4. Lists the contents of the directory after cleanup.
 * 5. Optionally recreates the directory if the recreate flag is set.
 *
 * @throws Will throw an error if the directory is not specified and GITHUB_WORKSPACE is not set.
 */
export async function run () {
  try {
    const directory = core.getInput('directory') || process.env.GITHUB_WORKSPACE
    const recreate = core.getInput('recreate') !== 'false'

    if (!directory) {
      throw new Error('Directory is not specified and GITHUB_WORKSPACE is not set.')
    }

    core.startGroup('List directory contents before cleanup')
    if (!fs.existsSync(directory)) {
      core.info(`The directory "${directory}" does not exist, nothing to delete.`)
      core.endGroup()
    } else {
      fs.readdirSync(directory).forEach(file => {
        core.info(file)
      })
      core.endGroup()

      core.startGroup('Perform Delete')
      core.info(`Deleting directory: "${directory}"`)
      fs.rmSync(directory, { recursive: true, force: true })
      core.endGroup()

      core.startGroup('List directory contents after cleanup')
      core.info(`Listing directory: "${directory}"`)
      if (!fs.existsSync(directory)) {
        core.info(`The directory "${directory}" does not exist.`)
      } else if (fs.readdirSync(directory).length === 0) {
        core.info(`The directory "${directory}" is empty.`)
      } else {
        fs.readdirSync(directory).forEach(file => {
          core.info(file)
        })
      }
    }

    if (recreate) {
      core.startGroup('Create directory')
      core.info(`Creating directory: "${directory}"`)
      fs.mkdirSync(directory, { recursive: true, mode: 0o755 })
      core.endGroup()
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

// Execute the main function
run()
