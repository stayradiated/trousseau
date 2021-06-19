import { exec } from 'child_process'

type EnvVars = {
  TROUSSEAU_PASSPHRASE?: string
  TROUSSEAU_STORE?: string
}

const trousseau = async (
  envVars: EnvVars,
  args: Array<string | undefined>,
): Promise<string> => {
  const command = ['trousseau', ...args].filter(Boolean).join(' ')

  console.log(command)
  return new Promise((resolve, reject) => {
    exec(
      command,
      {
        env: envVars,
      },
      (error, stdout, stderr) => {
        console.log({ error, stdout, stderr })
        if (error) {
          reject(error)
        } else {
          // Remove trailing new line
          resolve(stdout.replace(/\n$/, ''))
        }
      },
    )
  })
}

const version = async (): Promise<string> => {
  const args = ['--version']
  const stdout = await trousseau({}, args)
  const match = /[\d.]+/.exec(stdout)
  if (!match?.[0]) {
    throw new Error('Could not read Trousseau version!')
  }

  return match[0]
}

type EncryptionType = 'asymmetric' | 'symmetric'
type EncryptionAlgorithm = 'gpg' | 'aes'

type CreateOptions = {
  envVars: EnvVars
  recipients?: string
  encryptionType?: EncryptionType
  encryptionAlgorithm?: EncryptionAlgorithm
}

const create = async (options: CreateOptions): Promise<void> => {
  const { envVars, recipients, encryptionType, encryptionAlgorithm } = options

  const args = [
    'create',
    recipients,
    encryptionType && `--encryption-type ${encryptionType}`,
    encryptionAlgorithm && `--encryption-algorithm ${encryptionAlgorithm}`,
  ]

  await trousseau(envVars, args)
}

type SetOptions = {
  envVars: EnvVars
  key: string
  value?: string
  file?: string
}

const set = async (options: SetOptions): Promise<void> => {
  const { envVars, key, value, file } = options

  const args = ['set', key, value, file && `--file "${file}"`]

  await trousseau(envVars, args)
}

type GetOptions = {
  envVars: EnvVars
  key: string
  file?: string
}

const get = async (options: GetOptions): Promise<string> => {
  const { envVars, key, file } = options

  const args = ['get', key, file && `--file "${file}"`]

  return trousseau(envVars, args)
}

type RenameOptions = {
  envVars: EnvVars
  fromKey: string
  toKey: string
  overwrite?: boolean
}

const rename = async (options: RenameOptions): Promise<void> => {
  const { envVars, fromKey, toKey, overwrite } = options

  const args = ['rename', fromKey, toKey, overwrite ? '--overwrite' : undefined]

  await trousseau(envVars, args)
}

type DelOptions = {
  envVars: EnvVars
  key: string
}

const del = async (options: DelOptions): Promise<void> => {
  const { envVars, key } = options

  const args = ['del', key]

  await trousseau(envVars, args)
}

type KeysOptions = {
  envVars: EnvVars
}

const keys = async (options: KeysOptions): Promise<string[]> => {
  const { envVars } = options

  const args = ['keys']

  const stdout = await trousseau(envVars, args)

  return stdout.split('\n')
}

type ShowOptions = {
  envVars: EnvVars
}

const show = async (options: ShowOptions): Promise<Record<string, string>> => {
  const { envVars } = options

  const args = ['show']

  const stdout = await trousseau(envVars, args)

  const records: Record<string, string> = {}
  for (const line of stdout.split('\n')) {
    const match = /^(.*) : (.*)$/.exec(line)
    if (match?.[1] && match[2]) {
      const key = match[1]
      const value = match[2]
      records[key] = value
    }
  }

  return records
}

export { version, create, set, get, rename, del, keys, show }
