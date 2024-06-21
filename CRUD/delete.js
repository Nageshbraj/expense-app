const axios = require('axios')

const id = '65f80dd3595939e0ec1077c6'

axios.delete(`http://localhost:3068/delete-category/${id}`)
.then((response) => {
    console.log(response.data)
})
.catch((err) => {
    console.log(err.response.error)
})