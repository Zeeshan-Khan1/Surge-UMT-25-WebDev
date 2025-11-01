const fs = require('fs');
const pdfParse = require('pdf-parse');

const dataBuffer = fs.readFileSync("Surge '25 Web Hackathon Problem Set.pdf");

pdfParse(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(err => {
    console.error('Error:', err);
});

