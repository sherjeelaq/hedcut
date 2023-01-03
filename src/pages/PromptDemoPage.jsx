import { useState, useRef } from 'react'

function StyleDemoPage() {
  const inputImageRef = useRef()
  const containerRef = useRef()

  const [inputFile, setInputFile] = useState()
  const [prompt, setPrompt] = useState('hedcut style')
  const [structValue, setStructValue] = useState(0.16)
  const [conceptValue, setConceptValue] = useState(0.47)

  const [outputUrls, setOutputUrls] = useState([])

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
    setOutputUrls([])
    setLoading(true)
    const formData = new FormData()

    formData.append('input', inputFile)
    formData.append('prompt', prompt)
    formData.append('structValue', structValue)
    formData.append('conceptValue', conceptValue)

    await fetch('http://localhost:4000/getPromptPredictions', {
      method: 'POST',
      body: formData
    })
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
                    width: '35vw'
                  }}
                >
                  {outputUrls &&
                    outputUrls.length > 0 &&
                    outputUrls.map(url => (
                      <img
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
                    width: '35vw',
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
                    width: '35vw',
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
                    width: '35vw',
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
