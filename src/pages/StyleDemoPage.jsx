import { useState, useRef } from 'react'

function StyleDemoPage() {
  const inputImageRef = useRef()
  const styleImageRef = useRef()
  const containerRef = useRef()

  const [inputFile, setInputFile] = useState()
  const [styleFile, setStyleFile] = useState()
  const [outputUrl, setOutputUrl] = useState()

  const [loading, setLoading] = useState(false)

  const onInputImageChange = file => {
    setInputFile(file)
    inputImageRef.current.src = URL.createObjectURL(file)
  }

  const onStyleImageChange = file => {
    setStyleFile(file)

    styleImageRef.current.src = URL.createObjectURL(file)
  }

  const getPrediction = async () => {
    setOutputUrl()
    setLoading(true)
    const formData = new FormData()

    formData.append('input', inputFile)
    formData.append('style', styleFile)

    await fetch('http://localhost:4000/getStylePredictions', {
      method: 'POST',
      body: formData
    })
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
