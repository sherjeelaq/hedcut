import { useState, useEffect, useRef, useCallback } from 'react'
import InputImage from '../assets/input_image.png'
import StyleImage from '../assets/style_image.jpeg'
import OutputImage from '../assets/output_style_image.png'

function StyleDemoPage() {
  const inputImageRef = useRef()
  const styleImageRef = useRef()
  const containerRef = useRef()

  const [inputFile, setInputFile] = useState()
  const [styleFile, setStyleFile] = useState()
  const [outputUrl, setOutputUrl] = useState()

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
      styleImageRef.current.src = StyleImage
      setStyleFile(await convertUrlToFile(StyleImage))

      setOutputUrl(OutputImage)
    }
    getInitialImage()
  }, [convertUrlToFile])

  const onInputImageChange = file => {
    setInputFile(file)
    inputImageRef.current.src = URL.createObjectURL(file)
  }

  const onStyleImageChange = file => {
    setStyleFile(file)

    styleImageRef.current.src = URL.createObjectURL(file)
  }

  const getPrediction = async () => {
    if (!inputFile || !styleFile) {
      alert('Please fill all fields!')
      return
    }
    setOutputUrl()
    setLoading(true)
    const formData = new FormData()

    formData.append('input', inputFile)
    formData.append('style', styleFile)

    await fetch(
      `${import.meta.env.VITE_BACKEND_API}/getStylePredictions`,
      {
        method: 'POST',
        body: formData
      }
    )
      .then(data => data.json())
      .then(data => {
        setOutputUrl(data.url)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }
  return (
    <div>
      <h2>Style Demo</h2>
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
                    <p>Processing... It may take upto 2 minutes.</p>
                  )}
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
      <table className='images'>
        <tbody>
          <tr>
            <td>
              <fieldset id='fs_connection'>
                <legend>Output Image</legend>
                <div
                  ref={ref => (containerRef.current = ref)}
                  style={{
                    width: '35vw'
                  }}
                >
                  <img
                    src={outputUrl}
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
                  <strong>
                    <p>
                      Works best with equal width and height (e.g.
                      500x500, 552x552 and 1000x100 etc)
                    </p>
                  </strong>
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
            <td>
              <fieldset id='fs_connection'>
                <legend>Style Image</legend>
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
                    disabled={loading}
                    onChange={e =>
                      onStyleImageChange(e.target.files[0])
                    }
                  />
                  <img
                    ref={ref => (styleImageRef.current = ref)}
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
