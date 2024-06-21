const axios = require('axios')

const formData= {
    name:'rent'
}

const id='65f80dd3595939e0ec1077c6'

axios.put(`http://localhost:3068/update-category/${id}`, formData)
.then((response) => {
    console.log(response.data)
})
.catch((err) => {
    console.log(err.response.data)
})