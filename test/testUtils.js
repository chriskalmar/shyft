
export const asUser = (context, id, roles = []) => {
  context.req = {
    user: {
      id,
      roles
    }
  }

  return context
}

export const asAdmin = (context, id = 1) => {
  return asUser(context, id, ['admin'])
}


export const sleep = async (ms) => new Promise(resolve => {
  setTimeout(resolve, ms);
})

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}
