import express from 'express'
import Replicate from 'replicate-js'
import multer from 'multer'
import cors from 'cors'

import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const { dirname } = path

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 4000

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, './temp/'))
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        '-' +
        Date.now() +
        file.originalname.match(/\..*$/)[0]
    )
  }
})

const upload = multer({
  storage
})

app.use(cors())

app.post(
  '/getStylePredictions',
  upload.fields([
    {
      name: 'style',
      maxCount: 1
    },
    {
      name: 'input',
      maxCount: 1
    }
  ]),
  async function (req, res) {
    const inputImage = req.files.input[0]
    const styleImage = req.files.style[0]

    const inputImageBase64 =
      `data:${inputImage.mimetype};base64,` +
      fs.readFileSync(inputImage.path, 'base64')
    const styleImageBase64 =
      `data:${inputImage.mimetype};base64,` +
      fs.readFileSync(styleImage.path, 'base64')

    const replicate = new Replicate({
      token: process.env.REPLICATE_API
    })

    const model = await replicate.models.get(
      'huage001/adaattn',
      '957250892e7125f4834c5b5e5b5b2b43dc18ff174a6d70958574d08298567a21'
    )

    let prediction = null
    console.log('Please wait! Predicting...')
    while (!prediction) {
      prediction = await model.predict({
        content: inputImageBase64,
        style: styleImageBase64
      })
    }

    try {
      fs.unlinkSync(inputImage.path)
      fs.unlinkSync(styleImage.path)
    } catch (e) {
      console.log("Couldn't delete files : ", e)
    }
    res.send({ url: prediction })
  }
)

app.post(
  '/getPromptPredictions',
  upload.single('input'),
  async function (req, res) {
    const inputImage = req.file

    const { prompt, structValue, conceptValue } = req.body

    const inputImageBase64 =
      `data:${inputImage.mimetype};base64,` +
      fs.readFileSync(inputImage.path, 'base64')

    const prediction_data = {
      prompt,
      init_image: inputImageBase64,
      structural_image_strength: parseFloat(structValue),
      conceptual_image_strength: parseFloat(conceptValue)
    }

    const replicate = new Replicate({
      token: '2dac176f4df02135f99c39cea101b306ae735d89'
    })

    const model = await replicate.models.get(
      'vivalapanda/conceptual-image-to-image-1.5',
      '738154b934ddc51f3828f9ef34b500e40f4122018e669d95d25a2b26574fd206'
    )

    console.log('Please wait! Predicting...')
    let prediction = null
    while (!prediction) {
      prediction = await model.predict(prediction_data)
    }

    try {
      fs.unlinkSync(inputImage.path)
    } catch (e) {
      console.log("Couldn't delete files : ", e)
    }

    res.send({ url: prediction })
  }
)

app.get('/', async (req, res) => {
  res.send('Hello!')
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
