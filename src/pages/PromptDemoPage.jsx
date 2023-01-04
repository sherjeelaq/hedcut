import { useState, useRef, useEffect, useCallback } from 'react'
import InputImage from '../assets/input_image.png'
import OutputImageZero from '../assets/output_prompt_image_0.png'
import OutputImageOne from '../assets/output_prompt_image_1.png'
import OutputImageTwo from '../assets/output_prompt_image_2.png'
import OutputImageThree from '../assets/output_prompt_image_3.png'

function StyleDemoPage() {
  const inputImageRef = useRef()
  const containerRef = useRef()

  const [inputFile, setInputFile] = useState()
  const [prompt, setPrompt] = useState(
    'wall street hedcut style, poster edges filter, halftone filter, portrait, black and white'
  )
  const [structValue, setStructValue] = useState(0.16)
  const [conceptValue, setConceptValue] = useState(0.47)

  const [outputUrls, setOutputUrls] = useState([])

  const [loading, setLoading] = useState(false)

  const convertUrlToFile = useCallback(async url => {
    let blob = await fetch(url).then(r => r.blob())
    let dataUrl = await new Promise(resolve => {
      let reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    var arr = dataUrl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], `temp_image.${mime.split('/')[1]}`, {
      type: mime
    })
  }, [])

  useEffect(() => {
    async function getInitialImage() {
      inputImageRef.current.src = InputImage
      setInputFile(await convertUrlToFile(InputImage))
      setOutputUrls([
        OutputImageZero,
        OutputImageOne,
        OutputImageTwo,
        OutputImageThree
      ])
    }
    getInitialImage()
  }, [convertUrlToFile])

  const onInputImageChange = file => {
    setInputFile(file)
    inputImageRef.current.src = URL.createObjectURL(file)
  }

  const getPrediction = async () => {
    if (!inputFile || !prompt || !structValue || !conceptValue) {
      alert('Please fill all fields!')
      return
    }
    setOutputUrls([])
    setLoading(true)
    const formData = new FormData()

    formData.append('input', inputFile)
    formData.append('prompt', prompt)
    formData.append('structValue', structValue)
    formData.append('conceptValue', conceptValue)

    await fetch(
      `${import.meta.env.VITE_BACKEND_API}/getPromptPredictions`,
      {
        method: 'POST',
        body: formData
      }
    )
      .then(data => data.json())
      .then(data => {
        setOutputUrls(data.url)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }
  return (
    <div>
      <h2>Prompt Demo</h2>
      <table className='settings'>
        <tbody>
          <tr>
            <td>
              <fieldset>
                <div>
                  <button
                    type='button'
                    onClick={() => !loading && getPrediction()}
                  >
                    Submit
                  </button>
                  {loading && (
                    <p>Processing... It may take upto 3 minutes.</p>
                  )}
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
      <table className='output_container'>
        <tbody>
          <tr>
            <td>
              <fieldset id='fs_connection'>
                <legend>Output Image</legend>
                <div
                  ref={ref => (containerRef.current = ref)}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                  }}
                >
                  {outputUrls &&
                    outputUrls.length > 0 &&
                    outputUrls.map(url => (
                      <img
                        key={url}
                        src={url}
                        style={{
                          objectFit: 'contain',
                          width: '35vw'
                        }}
                      />
                    ))}
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td>
              <fieldset id='fs_connection'>
                <legend>Prompt Details</legend>
                <div
                  style={{
                    marginBottom: 16
                  }}
                >
                  <p>Prompt Text</p>
                  <input
                    type='text'
                    placeholder='Enter prompt'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    marginBottom: 16
                  }}
                >
                  <p>Structural Image Strength</p>
                  <p>
                    Structural (standard) image strength. 0.0
                    corresponds to full destruction of information,
                    and does not use the initial image for structure.
                  </p>
                  <input
                    type='number'
                    placeholder='Structural Image Strength'
                    value={structValue}
                    onChange={e => setStructValue(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    marginBottom: 16
                  }}
                >
                  <p>Conceptual Image Strength</p>
                  <p>
                    Conceptual image strength. 0.0 doesn't use the
                    image conceptually at all, 1.0 only uses the image
                    concept and ignores the prompt.
                  </p>
                  <input
                    type='number'
                    placeholder='Conceptual Image Strength'
                    value={conceptValue}
                    onChange={e => setConceptValue(e.target.value)}
                  />
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
      <table className='images'>
        <tbody>
          <tr
            style={{
              display: 'flex'
            }}
          >
            <td>
              <fieldset id='fs_connection'>
                <legend>Input Image</legend>
                <div
                  ref={ref => (containerRef.current = ref)}
                  style={{
                    width: '35vw'
                  }}
                >
                  <input
                    type='file'
                    accept='image/*'
                    className='input_file'
                    onChange={e =>
                      onInputImageChange(e.target.files[0])
                    }
                    disabled={loading}
                  />
                  <img
                    ref={ref => (inputImageRef.current = ref)}
                    style={{
                      objectFit: 'contain',
                      width: '35vw'
                    }}
                  />
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default StyleDemoPage
