'use strict';
import passport from 'passport';

const isAuthenticated = (req, res, next) => {
     if (req.isAuthenticated()) return next();
     return res.redirect('/login'); // ADD rota de retorno caso não autenticado
}
 
const isNotAuthenticated = (req, res, next) => {
     if (!req.isAuthenticated()) return next();
     return res.redirect('/dashboard'); // ADD rota de retorno caso não autenticado
}
 
const authenticateLogin = (req, res, next) => {
     if(!req.body.email && !req.body.password){
          return res.redirect('/login?success=false&message=Field is required');
     }
     passport.authenticate('local-login' , {
          successRedirect: '/dashboard', // ADD rota de successo no login
          failureRedirect: '/login?success=false&message=Username/Password incorrect', // ADD rota de falha no login
     })(req,res,next);
}

// const authenticateLogin = passport.authenticate('local-login' , (a, b, message) => {
//      console.log(message.message)
// });

const authenticateRegister = (req, res, next) => {
     if(!req.body.email && !req.body.password && !req.body.username){
          return res.redirect('/daftar?success=false&message=Field is required');
     }
     passport.authenticate('local-register', {
          successRedirect: '/dashboard', // ADD rota de successo no register
          failureRedirect: '/daftar?success=false&message=Username/Email has been used', // ADD rota de falha no register
     })(req,res,next);
}


export { 
     isAuthenticated, 
     isNotAuthenticated, 
     authenticateLogin, 
     authenticateRegister 
};