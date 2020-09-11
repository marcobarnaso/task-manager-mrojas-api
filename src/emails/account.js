const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// sgMail.send({
//     to: 'kdashcr@gmail.com',
//     from: 'marvin4891@hotmail.com',
//     subject: 'This is my first creation',
//     text: 'I hope this works'
// })

const sendWelcomeEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'marvin4891@hotmail.com',
        subject: 'Thanks for signing up',
        text: `welcome to the app, ${name}. Let me know how you get along with the app`
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'marvin4891@hotmail.com',
        subject: 'We sad to see you leave :(',
        text: `We would love your feedback ${name}, how can we improve?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}