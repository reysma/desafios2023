import passport from 'passport'
import local from 'passport-local'
import UserModel from '../models/user.models.js'
import GitHubStrategy from 'passport-github2'
import GoogleStrategy from 'passport-google-oauth2'
import { createHash, isValidPassoword } from '../utils.js'

const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use('google', new GoogleStrategy(
        {
            clientID: "440820918517-3ptdh25eaogs6qia2b331sjckpado76r.apps.googleusercontent.com",
            clientSecret: "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",
            callbackURL: "http://localhost:8080/session/googlecallback",
            passReqToCallback: true
        },
        async(request, accessToken, refreshToken, profile, done) => {

            console.log(profile);

            try {
                const user = await UserModel.findOne({email: profile._json.email})
                if(user) {
                    console.log('Usuario ya existe');
                    return done(null, user)
                }

                const newUser = {
                    first_name: profile._json.given_name,
                    last_name: profile._json.family_name,
                    email: profile._json.email,
                    password: ''
                }
                const result = await UserModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done('error entrando a Google' + error)
            }
        }
    ))

    passport.use('github', new GitHubStrategy(
        {
            clientID: "Iv1.3dda7836869aa567",
            clientSecret: "36463fddb7598e5a851dbcbf9911eb1d9c10a7eb",
            callbackURL: "http://localhost:8080/session/githubcallback"
        },
        async(accessToken, refreshToken, profile, done) => {
            console.log(profile);

            try {
                const user = await UserModel.findOne({email: profile._json.email})
                if(user) {
                    console.log('Usuario ya existe');
                    return done(null, user)
                }

                const newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    email: profile._json.email,
                    password: ""
                }
                const result = await UserModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done('error entrando a Github' + error)
            }
        }
    ))

    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true, usernameField: 'email'
        },
        async (req, username, password, done) => {
            const {first_name, last_name, email } = req.query
            try {
                const user = await UserModel.findOne({email: username})
                if(user) {
                    console.log('Usuario ya existe');
                    return done(null, false)
                }

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    password: createHash(password)
                }
                const result = await UserModel.create(newUser)
                return done(null, result)
            } catch (error) {
                return done("Error al registrarse " + error)
            }
        }
    ))

    passport.use('login', new LocalStrategy(
        { usernameField: 'email'},
        async(username, password, done) => {
            try {
                const user = await UserModel.findOne({email: username}).lean().exec()
                if(!user) {
                    console.error('Usuario No Existe');
                    return done(null, false)
                }

                if(!isValidPassoword(user, password)) return done(null, false)

                return done(null, user)
            } catch (error) {
                return done(error)
            }
        }
    ))
    
    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = await UserModel.findById(id)
        done(null, user)
    })

}

export default initializePassport