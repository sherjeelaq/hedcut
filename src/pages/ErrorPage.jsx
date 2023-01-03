import { Link } from 'react-router-dom'

function ErrorPage() {
  return (
    <div>
      There was an error finding that page!{' '}
      <Link to='/stippling-demo'>Go Back</Link>
    </div>
  )
}

export default ErrorPage
