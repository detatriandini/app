'use strict';
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../models";

export default ( passport ) => {
    
    passport.use('local-login', new LocalStrategy(
        { 
            usernameField: 'email', 
            passwordField: 'password' 
        },
        (email, password, done) => {
            User.findOne({ where: {email} })
                .then(async user => {
                    if (!user) { return done( null, false, {message: ''})}
                    if (await User.comparePassword(password, user)){
                        return done(null, user);
                    }else{
                        return done(null, false, {message: 'Email/Password incorrect!!'});
                    } 
                })
                .catch(err => done(null, false, {message: ''}));
        }
    ));

    passport.use('local-register', new LocalStrategy(
        { 
            usernameField: 'email', 
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, email, password, done) => {
            const {username} = req.body;
            User.findOne({ where: {
                username: username,
            } })
                .then(async user => {
                    if (user) { return done( null, false, {message: 'Username has been used!!'})}
                    if(!user){
                        User.findOne({ where: {
                            email: email,
                        } })
                            .then(async user => {
                                if (user) { return done( null, false, {message: 'Email has been used!!'})}
                                if(!user){
                                    User.create({username, email, password})
                                    .then(user => done(null, user))
                                    .catch(err => done(null, false, {message: ''}));
                                }
                            })
                            .catch(err => {
                                return done(null, false, {message: ''})
                            });
                    }
                })
                .catch(err => {
                    return done(null, false, {message: ''})
                });
        }
    ));
    
    // passas os dados para sessão
    passport.serializeUser(( user, done ) => {
        done( null, user.id );
    });
    
    passport.deserializeUser(( id, done ) => {
        User.findByPk(id)
            .then((user) => done(null, user))
            .catch((err) => done(err));
    });

}

