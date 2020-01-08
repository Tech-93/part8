import React from 'react'

const RecommendedBooks = (props) => {

    if (props.result.loading) {
        return <div>loading...</div>
      }
    


    const books = props.result.data.allBooks 
    console.log(books)

    const bookFilter = () => {
    
        const filteredBooks = books.filter(book => book.genres.includes(props.user.favoriteGenre))
        return filteredBooks.map(a => <tr key={a.title} >
            <td>{a.title}</td>
            <td>{a.author.name}</td>
            <td>{a.published}</td>
          </tr> )
    
      }
    

      

     

    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                author
              </th>
              <th>
                published
              </th>
            </tr>
            {bookFilter()}
          </tbody>
        </table>
      </div>
    )
}

export default RecommendedBooks