import * as core from '@actions/core'
import * as fs from 'fs'
import { run } from '../src'

jest.mock('@actions/core', () => ({
  ...jest.requireActual('@actions/core'),
  setFailed: jest.fn(),
  getInput: jest.fn(),
  info: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn()
}))

jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs')
  return {
    ...actualFs,
    existsSync: jest.fn(),
    readdirSync: jest.fn(),
    rmSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
      ...actualFs.promises,
      access: jest.fn(),
      readdir: jest.fn(),
      rm: jest.fn(),
      mkdir: jest.fn()
    }
  }
})

describe('run', () => {
  let mockGetInput: jest.MockedFunction<typeof core.getInput>
  let mockExistsSync: jest.Mock
  let mockReaddirSync: jest.Mock
  let mockRmSync: jest.Mock
  let mockMkdirSync: jest.Mock
  let mockSetFailed: jest.MockedFunction<typeof core.setFailed>

  beforeEach(() => {
    mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>
    mockExistsSync = fs.existsSync as jest.Mock
    mockReaddirSync = fs.readdirSync as jest.Mock
    mockRmSync = fs.rmSync as jest.Mock
    mockMkdirSync = fs.mkdirSync as jest.Mock
    mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>

    jest.clearAllMocks()
  })

  it('should throw an error if directory is not specified and GITHUB_WORKSPACE is not set', async () => {
    mockGetInput.mockReturnValue('')

    await run()

    expect(mockSetFailed).toHaveBeenCalledWith('Directory is not specified and GITHUB_WORKSPACE is not set.')
  })

  it('should not delete or create the directory if it does not exist and recreate is false', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'directory') return 'some-directory'
      if (name === 'recreate') return 'false'
      return ''
    })
    mockExistsSync.mockReturnValue(false)

    await run()

    expect(mockRmSync).not.toHaveBeenCalled()
    expect(mockMkdirSync).not.toHaveBeenCalled()
  })

  it('should delete the directory if it exists and recreate is false', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'directory') return 'some-directory'
      if (name === 'recreate') return 'false'
      return ''
    })
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([ 'file1', 'file2' ])

    await run()

    expect(mockRmSync).toHaveBeenCalledWith('some-directory', { recursive: true, force: true })
    expect(mockMkdirSync).not.toHaveBeenCalled()
  })

  it('should delete and recreate the directory if it exists and recreate is true', async () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'directory') return 'some-directory'
      if (name === 'recreate') return 'true'
      return ''
    })
    mockExistsSync.mockReturnValue(true)
    mockReaddirSync.mockReturnValue([ 'file1', 'file2' ])

    await run()

    expect(mockRmSync).toHaveBeenCalledWith('some-directory', { recursive: true, force: true })
    expect(mockMkdirSync).toHaveBeenCalledWith('some-directory', { recursive: true, mode: 0o755 })
  })
})
