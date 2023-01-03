import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  const buttons = [
    {
      name: 'Stippling Demo',
      link: '/stippling-demo'
    },
    {
      name: 'Style Demo',
      link: '/style-demo'
    },
    {
      name: 'Prompt Demo',
      link: '/prompt-demo'
    }
  ]

  return (
    <div className='sidebar'>
      {buttons.map(button => (
        <Link to={button.link} key={button.link}>
          {button.name}
        </Link>
      ))}
    </div>
  )
}

export default Sidebar
