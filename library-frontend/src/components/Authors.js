import React from 'react'
import BirthYearForm from './BirthYearFrom'

import { Mutation } from "react-apollo"


const Authors = (props) => {
  if (!props.show) {
    return null
  }

  if (props.result.loading) {
    return <div>loading...</div>
  }

  console.log(props.result)
  const authors = props.result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
           {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>

      <Mutation mutation={props.EDIT_AUTHOR}>
        {(editAuthor) =>
          <BirthYearForm
            editAuthor={editAuthor}
            authors={authors}
          />
        }
      </Mutation>
      


    </div>
  )
}

export default Authors