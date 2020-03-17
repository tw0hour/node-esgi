const fs = require('fs')
const util = require('util')
const express = require('express')
const app = express()

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

app.use(express.json()) // for parsing application/json

const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/hello', function (req, res) {
  const nom = req.query.nom
  if (nom) {
    res.send('Bonjour, ' + nom + ' !')
  } else {
    res.send('Quel est votre nom ?')
  }
})

app.post('/chat', function (req, res) {
  if (req.body.msg === 'ville') {
    res.send('Nous sommes à Paris')
  } else if (req.body.msg === 'météo') {
    res.send('Il fait beau')
  } else {
    if (/ = /.test(req.body.msg)) {
      const [ cle, valeur ] = req.body.msg.split(' = ')
      readValuesFromFile()
        .then(valeursExistantes => {
          const data = JSON.stringify({
            ...valeursExistantes,
            [cle]: valeur
          })
          writeFile('réponses.json', data).then(() => {
            console.log('appel au callback de writefile')
            res.send('Merci pour cette information !')
          }).catch((error) => {
            console.log('appel au callback de writefile')
            console.error('error while saving réponses.json', err)
            res.send('Il y a eu une erreur lors de l\'enregistrement')
          });
          console.log('appel à writefile effectué')
        })
        .catch(err => {
          res.send('error while reading réponses.json', err)
        })
    } else {
      const cle = req.body.msg
      readValuesFromFile()
        .then((values) => {
          const reponse = values[cle]
          res.send(cle + ': ' + reponse)
        })
        .catch((err) => {
          res.send('error while reading réponses.json', err)
        })
    }
  }
})

app.listen(PORT, function () {
  console.log('Example app listening on port ' + PORT)
})

/*
function readValuesFromFile(callback) {
  fs.readFile('réponses.json', { encoding: 'utf8' }, (err, reponses) => {
    if (err) {
      callback(err);
    } else {
      const valeursExistantes = JSON.parse(reponses);
      callback(null, valeursExistantes);
    }
  });
}
*/

function readValuesFromFile() {
  return new Promise((resolve, reject) => {
    readFile('réponses.json', { encoding: 'utf8' })
      .then(reponses => {
        const valeursExistantes = JSON.parse(reponses);
        resolve(valeursExistantes);
      })
      .catch(err => {
        reject(err);
      })
  })
}

