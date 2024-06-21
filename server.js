const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const { checkSchema, validationResult} = require('express-validator')
const app = express()
const port = 3068

app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/expense-app')
    .then(() => {
        console.log('connected to db')
    })
    .catch((err) => {
        console.log('error connecting to db', err)
    })

const {Schema, model} = mongoose
const categorySchema = new Schema({
    name: String},
    {timestamps: true})

const Category = model('Category', categorySchema)

app.get('/all-categories', (req,res) => {
    Category.find()
        .then((data) => {
            res.json(data)
        })
        .catch((err) => {
            res.json(err)
        })
})

const idValidationSchema = {
    id: {
        in: ['params'],
        isMongoId: {
            errorMessage: 'should be a valid mongodb id'
        }
    }
}

app.get('/single-category/:id', checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    Category.findById(id)
    .then((category) => {
        if(!category){
            return res.status(404).json({})
        }
        res.json(category)
    })
    .catch((err) => {
        res.json(err)
    })
})

const categoryValidationSchema = {
    name: {
        in: ['body'],
        notEmpty: {
            errorMessage: 'Name cannot be empty'
        },
        trim: true,
        custom: {
            options: function(value){
                return Category.findOne({name: value})
                .then((obj) => {
                    if(obj){
                    throw new Error('category name already taken')
                    }
                    return true
                })
            }
        }
    }
}


app.post('/create-category', checkSchema(categoryValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const body = req.body
    Category.create(body)
    .then((data) => {
        res.status(201).json(data)
    })
    .catch((err) => {
        res.json(err)
    })
})


app.put('/update-category/:id',checkSchema(categoryValidationSchema), checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    const body = req.body
    Category.findByIdAndUpdate(id, body, {new:true})
    .then((category) => {
        if(!category){
            return res.status(404).json({})
        }
        res.json(category)
    })
    .catch((err) => {
        res.json(err)
    })
})

app.delete('/delete-category/:id', checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    Category.findByIdAndDelete(id)
    .then((category) => {
        if(!category){
            return res.status(404).json({})
        }
        res.json(category)
    })
    .catch((err) => {
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    })
})


const expenseSchema = new Schema({expenseDate: Date,
                                  amount: Number,
                                  description: String},
                                 {timestamps:true})

const Expense = model('Expense', expenseSchema) 

const expenseValidationSchema = {
    expenseDate: {
        in: ['body'],
        exists: {
            errorMessage: 'expense date is required'
        },
        notEmpty: {
            errorMessage: 'expense date cannot be empty'
        },
        isDate: {
            errorMessage: 'expense date is not valid'
        },
        custom: {
            options: function(value){
                if(new Date(value) > new Date()){
                    throw new Error('expense data cannot be greater than today')
                }
                return true
            }
        }
    },
    amount: {
        in: ['body'],
        exists: {
            errorMessage: 'expense amount is required'
        },
        notEmpty: {
            errorMessge: 'amount should not be empty'
        },
        isNumeric: {
            errorMessage: 'amount should be a number'
        },
        custom: {
            options: function(value){
                if(value < 1){
                    throw new Error('amount should be greater than zero')
                }
                return true
            }
        }
    }
}

app.get('/all-expenses', (req,res) => {
    Expense.find()
        .then((expenses) => {
            res.json(expenses)
        })
        .catch((err) => {
            res.json(err)
        })
})

app.get('/single-expense/:id', checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    Expense.findById(id)
    .then((expense) => {
        if(!expense){
            return res.status(404).json({})
        }
        res.json(expense)
    })
    .catch((err) => {
        res.json(err)
    })
})

app.post('/create-expense', checkSchema(expenseValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
    }
    const body = req.body
    const expenseObj = new Expense(body)
    expenseObj.save()
    .then((data) => {
        res.json(data)
    })
    .catch((err) =>{
        res.json(err)
    })
})

app.put('/update-expense/:id', checkSchema(expenseValidationSchema), checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    const body = req.body
    Expense.findByIdAndUpdate(id, body, {new:true})
    .then((data) => {
        if(!data){
            return res.status(404).json({})
        }
        res.json(data)
    })
    .catch((err) => {
        res.json(err)
    })
})

app.delete('/delete-expense/:id', checkSchema(idValidationSchema), (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const id = req.params.id
    Expense.findByIdAndDelete(id)
    .then((data) => {
        if(!data){
            return res.status(404).json({})
        }
        res.json(data)
    })
    .catch((err) => {
        res.status(500).json({error: 'Internal server error'})
    })
})

app.listen(port, () => {
    console.log('server is running successfully in port', port)
})