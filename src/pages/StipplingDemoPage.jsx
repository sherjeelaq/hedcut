import { useState, useRef, useEffect, useCallback } from 'react'
import './StipplingDemoPage.css'
import InputImage from '../assets/input_image.png'

function StipplingDemoPage() {
  const inputCanvasRef = useRef()
  const containerRef = useRef()

  const workerRef = useRef()
  const widthRef = useRef()
  const heightRef = useRef()

  const threshold = 0.9

  const [input, setInput] = useState()
  const [points, setPoints] = useState(15000)

  useEffect(() => {
    async function getInitialImage() {
      let blob = await fetch(InputImage).then(r => r.blob())
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

      const file = new File([u8arr], 'input_image.png', {
        type: mime
      })
      setInput(file)
    }
    getInitialImage()
  }, [])

  const onInputImageChange = useCallback(
    file => {
      const canvas = inputCanvasRef.current
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      workerRef.current &&
        workerRef.current.terminate &&
        workerRef.current.terminate()

      let img = new Image()
      workerRef.current = new Worker('worker.js')

      img.src = URL.createObjectURL(file)

      setInput(file)

      img.onload = function () {
        widthRef.current = this.width * 0.5
        heightRef.current = this.height * 0.5

        canvas.width = this.width
        canvas.height = this.height * 0.5

        ctx.drawImage(img, 0, 0, widthRef.current, heightRef.current)

        // Blur image to smooth it out
        StackBlur.canvasRGBA(
          canvas,
          0,
          0,
          widthRef.current,
          heightRef.current,
          5
        )
        const density = getDensityFunction(ctx)

        ctx.drawImage(img, 0, 0, widthRef.current, heightRef.current)

        // Get initial points
        const initPoints = generatePoints(density, points)

        workerRef.current.onmessage = event => draw(event.data)

        // Compute in worker
        workerRef.current.postMessage({
          density,
          points: initPoints,
          width: widthRef.current,
          height: heightRef.current,
          threshold
        })
      }
    },
    [points]
  )

  // Draw the points
  function draw(points) {
    const canvas = inputCanvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(
      widthRef.current,
      0,
      widthRef.current,
      heightRef.current
    )

    points.forEach(function (point) {
      ctx.beginPath()

      if (point.r) {
        ctx.arc(
          widthRef.current + point[0],
          point[1],
          point.r,
          0,
          2 * Math.PI
        )
        ctx.fill()
      }
    })
  }

  function generatePoints(density, numPoints) {
    // Generate starting points with rejection sampling against pixel brightness
    return d3.range(numPoints).map(function () {
      let x, y, d

      while (true) {
        x = Math.random() * widthRef.current
        y = Math.random() * heightRef.current

        d = density[widthRef.current * Math.floor(y) + Math.floor(x)]

        if (Math.random() > d) {
          return [x, y, d]
        }
      }
    })
  }

  // Convert imageData into an array of brightness values from 0-1
  function getDensityFunction(context) {
    const data = context.getImageData(
      0,
      0,
      widthRef.current,
      heightRef.current
    ).data

    return d3.range(0, data.length, 4).map(i => data[i] / 255)
  }

  useEffect(() => {
    let timer
    if (points && input) {
      timer = setTimeout(() => {
        onInputImageChange(input)
      }, 500)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [points, input, onInputImageChange])

  return (
    <div>
      <h2>Stippling Demo</h2>
      <table className='settings'>
        <tbody>
          <tr>
            <td>
              <fieldset id='fs_connection'>
                <legend>Total Points</legend>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <input
                    type='range'
                    id='vol'
                    name='vol'
                    value={points}
                    onChange={e => setPoints(e.target.value)}
                    min='1000'
                    max='100000'
                  />
                  <p
                    style={{
                      marginLeft: 20
                    }}
                  >
                    {points}
                  </p>
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
                <legend>Input Image</legend>
                <div
                  ref={ref => (containerRef.current = ref)}
                  style={{
                    width: '74vw'
                  }}
                >
                  <input
                    type='file'
                    accept='image/*'
                    className='input_file'
                    onChange={e =>
                      onInputImageChange(e.target.files[0])
                    }
                  />
                  <canvas
                    className='canvas'
                    ref={ref => (inputCanvasRef.current = ref)}
                  ></canvas>
                </div>
              </fieldset>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default StipplingDemoPage
