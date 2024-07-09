import express from 'express';
import compression from 'compression';
import accepts from 'accepts';
import { readFileSync } from 'fs';
import supportedLanguages from './supported-languages.json' assert { type: "json" };

//Create an app
const app = express();

app.use((req, res, next) => {
    // Detect language from accept-header
    const acceptedLanguages = accepts(req).languages();
    let finalAcceptedLanguage = 'en-US';
    for (var i = 0; i < acceptedLanguages.length; i++) {
        const langElements = acceptedLanguages[i].split('-');
        var lang = langElements[0]?.toLocaleLowerCase();

        if (supportedLanguages.includes(lang)) {
            finalAcceptedLanguage = lang;
            break;
        }
    }
    res.locals.language = finalAcceptedLanguage;
    
    // Continue handling request
    next();
});

// Global middlewares
app.use(compression());
app.use(express.static('.', {index: false}));

// EXPLAINER
// We want the urls to be the same no matter what language we serve. But because all 
// js-files for each angular build has the samme hash (even with different langauge content),
// we need to serve the js-files with their respective language in the path.

// In short: 
// - Assets are served for their language folder (fx. https://server/en/runtime.31231.js)
// - Html is served wihout the language (fx. https://server/myview)
// See https://github.com/angular/angular-cli/issues/17416#issuecomment-1143766964
    
// Index files
app.get('/*', function (req, res, next) {

    const basePath = `./${res.locals.language}`;
    const path = `${basePath}/index.html`;

    const file = readFileSync(path, "utf8");
    res.status(200).send(file);
});

app.get('*', function (req, res) {
    res.redirect('/');
});

//Listen port
const PORT = 80;
app.listen(PORT);
console.log(`Running on port ${PORT}`);
