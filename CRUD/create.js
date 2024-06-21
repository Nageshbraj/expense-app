const axios = require('axios')

const formData = {
    name: 'Bills'
}

axios.post('http://localhost:3068/create-category', formData)
.then((response) => {
    console.log(response.data)
})
.catch((err) => {
    console.log(err)
})