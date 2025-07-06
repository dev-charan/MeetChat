import React from 'react'

const App = () => {
  return (
    <div className='p-4 space-y-4'>
<details className="dropdown">
  <summary className="btn m-1">open or close</summary>
  <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
    <li><a>Item 1</a></li>
    <li><a>Item 2</a></li>
  </ul>
</details>    </div>
  )
}

export default App
