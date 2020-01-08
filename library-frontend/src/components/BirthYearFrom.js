import React, { useState } from 'react'


const BirthYearForm = (props) => {

    const [name, setName] = useState('')
    const [setBornTo, setBirthYear] = useState('')

    const handleChange = (event) => {
        setName(event.target.value)
    }
    
    
    const update = async (e) => {
        e.preventDefault()
        await props.editAuthor({
            variables: { name, setBornTo }
          })
        console.log('updateing author...')
        setName('')
        setBirthYear('')
    }

    return (
        <div>
          <h2> set Birthyear </h2>
          <form onSubmit={update}>
            <select value={name} onChange={handleChange} > 
              {props.authors.map(a => 
                <option key={a.id} value={a.name} > {a.name} </option> 
                )}
            </select>  
            <div> 
              born <input type='number' value={setBornTo} onChange={({target}) => setBirthYear(parseInt(target.value)) } />     
            </div>
            <button type="submit" > update author </button>
            </form>
        </div>
    )
}

export default BirthYearForm


