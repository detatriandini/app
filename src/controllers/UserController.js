const getLogin =  (req , res) => {
     res.render('page/login', {session: false, dashboard: false, message: ""});
}

const getRegister = (req, res) => {
     res.render('page/register', {session: false, dashboard: false, message: ""});
}

const getReset = (req, res) => {
     res.render('page/reset', {session: false, dashboard: false});
}

const getIndex = (req, res) => {
     res.render('page', {dashboard: false});
}

const getAbout = (req, res) => {
     res.render('page/about', {dashboard: false});
}

const getContact = (req, res) => {
     res.render('page/contact', {dashboard: false});
}

const getAuth = (req, res) => {
     res.render('page/auth', {dashboard: false});
}

const getLogout = (req, res) => {
     req.logout(() => res.redirect('/'));
}

export default { 
     getLogin, 
     getRegister, 
     getIndex, 
     getAbout, 
     getContact, 
     getAuth, 
     getLogout,
     getReset
};