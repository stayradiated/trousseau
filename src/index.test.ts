import test from 'ava'

import * as trousseau from './index.js'

const envVars = {
  TROUSSEAU_PASSPHRASE: 'secret',
  TROUSSEAU_STORE: '/tmp/trousseau',
}

test.serial('version', async (t) => {
  const version = await trousseau.version()
  console.log(version)
  t.pass()
})

test.serial('create', async (t) => {
  await trousseau.create({
    envVars,
    encryptionType: 'symmetric',
  })
  t.pass()
})

test.serial('set', async (t) => {
  await trousseau.set({
    envVars,
    key: 'key',
    value: 'value',
  })
  t.pass()
})

test.serial('get', async (t) => {
  await trousseau.get({
    envVars,
    key: 'key',
  })
  t.pass()
})

test.serial('rename', async (t) => {
  await trousseau.rename({
    envVars,
    fromKey: 'key',
    toKey: 'renamed_key',
  })
  t.pass()
})

test.serial('keys', async (t) => {
  const keys = await trousseau.keys({
    envVars,
  })
  t.deepEqual(keys, ['renamed_key'])
})

test.serial('show', async (t) => {
  const items = await trousseau.show({
    envVars,
  })
  t.deepEqual(items, { renamed_key: 'value' })
})

test.serial('del', async (t) => {
  await trousseau.del({
    envVars,
    key: 'renamed_key',
  })
  t.pass()
})
