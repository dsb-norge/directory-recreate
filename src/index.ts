import { getInput, startGroup, endGroup, info, setFailed } from '@actions/core'
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
    const directory = getInput('directory') || process.env.GITHUB_WORKSPACE
    const recreate = getInput('recreate') !== 'false'

    if (!directory) {
      throw new Error('Directory is not specified and GITHUB_WORKSPACE is not set.')
    }

    startGroup('List directory contents before cleanup TODO')
    if (!fs.existsSync(directory)) {
      info(`The directory "${directory}" does not exist, nothing to delete.`)
      endGroup()
    } else {
      fs.readdirSync(directory).forEach(file => {
        info(file)
      })
      endGroup()

      startGroup('Perform Delete')
      info(`Deleting directory: "${directory}"`)
      fs.rmSync(directory, { recursive: true, force: true })
      endGroup()

      startGroup('List directory contents after cleanup')
      info(`Listing directory: "${directory}"`)
      if (!fs.existsSync(directory)) {
        info(`The directory "${directory}" does not exist.`)
      } else if (fs.readdirSync(directory).length === 0) {
        info(`The directory "${directory}" is empty.`)
      } else {
        fs.readdirSync(directory).forEach(file => {
          info(file)
        })
      }
    }

    if (recreate) {
      startGroup('Create directory')
      info(`Creating directory: "${directory}"`)
      fs.mkdirSync(directory, { recursive: true, mode: 0o755 })
      endGroup()
    }
  } catch (error) {
    setFailed((error as Error).message)
  }
}

// Execute the main function
run()
