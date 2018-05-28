
export const asUser = (userId, userRoles = []) => {
  return {
    loaders: {},
    userId,
    userRoles,
  }
}

export const asAdmin = (userId = 1) => {
  return asUser(userId, ['admin'])
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
