import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import mongoose from 'mongoose'
import passport from 'passport'
import handlebars from 'express-handlebars'
import initializePassport from './config/passport.config.js'
import __dirname from './utils.js'
import sessionRouter from './router/session.router.js'
import jwtRouter from './router/jwt.router.js'

const PORT = 8080;
const app = express()
const dbName = "baseCRUD"

const MONGO_URI = 'mongodb+srv://reysma:458260rey@cluster0.o8moagj.mongodb.net/?retryWrites=true&w=majority'

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        dbName,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        ttl: 15
    }),
    secret: '1234567',
    resave: true,
    saveUninitialized: true
}))

initializePassport()
app.use(passport.initialize())
app.use(passport.session())

function auth(req, res, next) {
  
    if(req.session?.user) return next()

    return res.status(401).send('Error Auth ')
}

app.get('/', (req, res) => res.send('OK'))
app.get('/private', auth, (req, res) => {
    res.json(req.session.user)
})

app.use('/session', sessionRouter)
app.use('/jwt', jwtRouter)


mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URI, 
  { dbName},  (error) => { 
      if(error) {
        console.log('BD Not Found Connecting');
      process.exit();
        }
    console.log('DB Connected!');
    app.listen(PORT, () => console.log('Server Listening...!!!'));
})     




