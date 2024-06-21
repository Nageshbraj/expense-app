const axios = require('axios')

axios.get('http://localhost:3068/all-categories')
.then((response) => {
    console.log(response.data)
})
.catch((err) => {
    console.log(err)
})