import axios from 'axios'

const options = {
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
}

const http = axios.create(options)

http.interceptors.response.use(
  (response) => response, // Pass successful responses through
  (error) => Promise.resolve(error?.response), // Pass the error to be handled where the request is called
)

export default http
