import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { run } from '../src/run.ts'

describe('run', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'directory-recreate-test-'))
    process.exitCode = 0
  })

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
    delete process.env.INPUT_DIRECTORY
    delete process.env.INPUT_RECREATE
    delete process.env.GITHUB_WORKSPACE
    process.exitCode = 0
  })

  it('fails if directory is not specified and GITHUB_WORKSPACE is not set', async () => {
    await run()

    assert.equal(process.exitCode, 1)
  })

  it('leaves a non-existent directory alone when recreate is false', async () => {
    const target = path.join(tmpDir, 'does-not-exist')
    process.env.INPUT_DIRECTORY = target
    process.env.INPUT_RECREATE = 'false'

    await run()

    assert.equal(fs.existsSync(target), false)
    assert.equal(process.exitCode, 0)
  })

  it('deletes the directory if it exists and recreate is false', async () => {
    fs.writeFileSync(path.join(tmpDir, 'file1'), 'a')
    fs.writeFileSync(path.join(tmpDir, 'file2'), 'b')
    process.env.INPUT_DIRECTORY = tmpDir
    process.env.INPUT_RECREATE = 'false'

    await run()

    assert.equal(fs.existsSync(tmpDir), false)
    assert.equal(process.exitCode, 0)
  })

  it('deletes and recreates the directory if it exists and recreate is true', async () => {
    fs.writeFileSync(path.join(tmpDir, 'file1'), 'a')
    fs.writeFileSync(path.join(tmpDir, 'file2'), 'b')
    process.env.INPUT_DIRECTORY = tmpDir
    process.env.INPUT_RECREATE = 'true'

    await run()

    assert.equal(fs.existsSync(tmpDir), true)
    assert.deepEqual(fs.readdirSync(tmpDir), [])
    assert.equal(process.exitCode, 0)
  })

  it('creates the directory if it does not exist and recreate is true (default)', async () => {
    const target = path.join(tmpDir, 'new-subdir')
    process.env.INPUT_DIRECTORY = target

    await run()

    assert.equal(fs.existsSync(target), true)
    assert.deepEqual(fs.readdirSync(target), [])
    assert.equal(process.exitCode, 0)
  })
})
