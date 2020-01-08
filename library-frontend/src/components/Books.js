import React, {useState} from 'react'
import { gql } from 'apollo-boost'
import Book from './Book'


const BOOKS_BY_GENRE = gql`
  query allBooksByGenre($genreToSearch: String!) {
    allBooks(genre: $genreToSearch) {
      title 
      author { name } 
      published
      genres
    }
  }
`




const Books = (props) => {

  const [genredBooks, setgenredBooks] = useState(null)
  const [genre, setGenre] = useState('all genres')



  if (!props.show) {
    return null
  }
  if (props.result.loading) {
    return <div>loading...</div>
  }




  const showBooks = async (genre) => {
    const { data } = await props.client.query({
      query: BOOKS_BY_GENRE,
      variables: { genreToSearch: genre }
    })
    setgenredBooks(data.allBooks)
    setGenre(genre)
  }



  const books = props.result.data.allBooks 



  const GenreSelector = () => {
    const merged = [].concat.apply([], books.map(book => book.genres))
    const distinctGenres = [...new Set(merged.map(genre => genre))]
    return(
      <div>
        {distinctGenres.map(genre => <button key={genre} onClick={() => showBooks(genre) } > {genre} </button>)}
        <button onClick={() => setGenre('all genres') } > all genres </button>
      </div>
    )
  }

  

  const bookFilter = () => {
    if(genre === 'all genres') {
      return books.map(book => <Book key={book.title} book={book} />)
    }
    return genredBooks.map(book => <Book key={book.title} book={book} />   )
  }



  return (
    <div>
      <h2>books</h2>

      <div> in genre {genre} </div>

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

      <GenreSelector /> 

    </div>
  )
}

export default Books