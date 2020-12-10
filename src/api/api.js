function makeRequest({ url, method, headers, data }) {
  let options = {
    method: method,
    headers: {
      'Content-type': 'application/json',
      ...headers
    },
    body: data ?
      JSON.stringify({
        ...data
      }) : null
  }

  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then((res) => {
        if (res.status < 400) {
          if (res.headers.get('content-type')?.indexOf('application/json') > -1) {
            resolve(res.json())
          } else {
            resolve(res)
          }
          return
        } else {
          if (res.headers.get('content-type')?.indexOf('application/json') > -1) {
            console.log(res.json())
          } else {
            console.log(res)
          }
          reject(res.error);
          return
        }
      })
      .catch((err) => {
        reject(err);
        return
      })
  })
}

export const login = (username, password) => makeRequest({
  url: '/token-auth/',
  method: 'POST',
  data: {
    username: username, 
    password: password
  }
}).then(res => {
  localStorage.setItem('token', res.token)
})

export const register = (username, password) => makeRequest({
  url: '/authentication/users/',
  method: 'POST', 
  data: {
    username: username,
    password: password
  }
}).then(res => {
  localStorage.setItem('token', res.token)
})

export const current_user = () => makeRequest({
  url: '/authentication/current_user/',
  method: 'GET',
  headers: {
    Authorization: `JWT ${localStorage.getItem('token')}`
  }
})

export const logout = () => {
  localStorage.removeItem('token')
}

export const train = ({ 
  width, height, cargoPickups, cargoDropoffs
}) => makeRequest({
  url: '/api/train/',
  method: 'POST',
  data: { 
    width: width, 
    height: height, 
    cargo_pickups: cargoPickups, 
    cargo_dropoffs: cargoDropoffs
  }
})

export const get = ({ 
  width, height, cargoPickups, cargoDropoffs
}) => makeRequest({
  url: '/api/get/',
  method: 'POST',
  data: {
    width: width, 
    height: height, 
    cargo_pickups: cargoPickups, 
    cargo_dropoffs: cargoDropoffs
  }
})

export const run = ({
  matrix, truckLocation, width, height, cargoPickups, cargoDropoffs
}) => makeRequest({
  url: '/api/run/',
  method: 'POST',
  data: {
    q_matrix: matrix,
    truck_location: truckLocation,
    width: width,
    height: height,
    cargo_pickups: cargoPickups,
    cargo_dropoffs: cargoDropoffs
  }
})