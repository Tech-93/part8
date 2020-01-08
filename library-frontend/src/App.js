import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { Query, Subscription, ApolloConsumer } from 'react-apollo'
import { gql } from 'apollo-boost'
import { Mutation } from "react-apollo"


const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`


const ALL_AUTHORS = gql`
{
  allAuthors  {
    name
    born
    id
    bookCount
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks  {
    title
    author { name }
    published
    genres
    id
  }
}
`

const ME = gql`
{
  me  {
    favoriteGenre
    id
  }
}
`

const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String, $published: Int!, $genres: [String]) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
      author { name }
      published
      genres
      id
    }
  }
`
const EDIT_AUTHOR = gql`
mutation editAuthor($name: String!, $setBornTo: Int!) {
  editAuthor(
    name: $name,
    setBornTo: $setBornTo
  ) {
    name
    born
    id
  }
}
`

const BOOKS_SUBSCRIPTION = gql`
subscription bookAdded {
  bookAdded {
    title
    author { name }
    published
  }
}
`


const App = (props) => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  

  const logout = () => {
    setToken(null)
    localStorage.clear()
    props.client.resetStore()
    setPage('authors')
  }





  if(!token) {
    return (
      <div>
        <div>
         <button onClick={() => setPage('authors')}>authors</button>
         <button onClick={() => setPage('books')}>books</button>
         <button onClick={() => setPage('login') } > login </button>
       </div>

       <Query query={ALL_AUTHORS} pollInterval={2000} >
         {(result) => <Authors show={page === 'authors'} result={result} EDIT_AUTHOR={EDIT_AUTHOR} />}
       </Query>

       <ApolloConsumer>
         {(client => 
           <Query query={ALL_BOOKS} pollInterval={2000} >
             {(result) => <Books show={page === 'books'} result={result} client={client} />}
           </Query> 
         )}
       </ApolloConsumer>


       <Mutation mutation={LOGIN} >
         {(login) =>
           <LoginForm login={login} show={page === 'login'} setToken={setToken} setPage={setPage} />
         }
       </Mutation>
      </div>
    )
  }


  

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommendations')} > recommended </button>
        <button onClick={logout} > logout </button>
      </div>
      
      <Subscription subscription={BOOKS_SUBSCRIPTION}>
        {({ data }) => {
          if(data === undefined){
            return null
          }
          console.log('DATA' , data)
          return <h3> Newest book: { data.bookAdded.title } ({data.bookAdded.published}) by {data.bookAdded.author.name} </h3>
        }}
      </Subscription>

      <Query query={ALL_AUTHORS} pollInterval={2000} >
        {(result) => <Authors show={page === 'authors'} result={result} EDIT_AUTHOR={EDIT_AUTHOR} />}
      </Query>

      <ApolloConsumer>
        {(client => 
          <Query query={ALL_BOOKS} pollInterval={2000} >
            {(result) => <Books show={page === 'books'} result={result} client={client} />}
          </Query> 
        )}
      </ApolloConsumer>

    
      <Mutation mutation={ADD_BOOK}>
        {(addBook) =>
          <NewBook
            addBook={addBook}
            show={page === 'add'}
          />
        }
      </Mutation>

      <ApolloConsumer>
        {(client => 
          <Query query={ME} pollInterval={2000} >
            {(result) => <Recommendations show={page === 'recommendations'} result={result} ALL_BOOKS={ALL_BOOKS} client={client} />}
          </Query> 
        )}
      </ApolloConsumer>    

    </div>
  )
}

export default App
