
export const asUser = (id, roles = []) => {
  return {
    loaders: {},
    req: {
      user: {
        id,
        roles
      }
    }
  }
}

export const asAdmin = (id = 1) => {
  return asUser(id, ['admin'])
}


export const sleep = async (ms) => new Promise(resolve => {
  setTimeout(resolve, ms);
})

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}


export const removeDynamicData = (entity, payload) => {
  const ret = {
    ...payload
  }

  delete ret.createdAt
  delete ret.updatedAt

  if (entity.name === 'Profile') {
    delete ret.registeredAt
  }

  return ret
}


export const removeListDynamicData = (entity, payloadList) => {
  return payloadList.map(payload => {
    return removeDynamicData(entity, payload)
  })
}
