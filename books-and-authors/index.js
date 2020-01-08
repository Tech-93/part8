const { ApolloServer, UserInputError, gql } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const JWT_SECRET = 'SECRED'


const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const uuid = require('uuid/v1')


mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://FullPhoneDB:regendrop93@cluster0-cvyqw.mongodb.net/graphql?retryWrites=true&w=majority'


console.log('connecting to ' , MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true  })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })










const typeDefs = gql`

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}


type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}

  type Author {
      name: String!
      born: Int
      books: [Book!]
      id: ID!
      bookCount: Int
      
  }

  

    

  type Mutation {
    addBook(
      title: String!
      author: String
      published: Int!
      genres: [String]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }


  type Query {
    hello: String!
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }
  
  type Subscription {
    bookAdded: Book!
  }  
 
`






const resolvers = {


  Query: {
    hello: () => { return "world" },
    bookCount: async () => { 
      const books = await Book.find({}).populate('author', {name: 1}) 
      return books.length
    },
    authorCount: async () => {
      const authors = await Author.find({})
      return authors.length
    },
    allBooks: async (root, args) => {

      const books = await Book.find({}).populate('author', {name: 1}) 

      if(args.genre) {
        return books.filter(book => book.genres.includes(args.genre))
      } else {
        return books
      }
    },
    allAuthors: async () => {
      const authors = await Author.find({}).populate('books')
      console.log(authors)
      return authors
    },
    me: (root, args, context) => {

      return context.currentUser
    }
  },
  Author: {
      bookCount: async (root) => {
        console.log('BOOKcOUNT')
        const books = await Book.find({}).populate('author', {name: 1}) 
        return books.filter(book => book.author.name === root.name).length
      }
  },
  Mutation: {
    addBook: async (root, args, context) => {

      const currentUser = context.currentUser

      if (!currentUser) {
      throw new AuthenticationError("not authenticated")
      }

      const author = await Author.findOne({ name: args.author })
      
      if(author === null) {
        const newAuthor = {
          name: args.author,
          born: 0
        }
        const authorToSave = new Author(newAuthor)
        try{
          await authorToSave.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        
        const authorToAdd = await Author.findOne({ name: args.author })

        const book = new Book({ ...args, author: authorToAdd})
        try {
          await book.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
      }

      
      const book = new Book({ ...args, author: author})
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book.save()
      
    },
    editAuthor: async (root, args) => {


      
      const author = await Author.findOne({ name: args.name })

      
      if(!author) {
        return null
      }



      const updatingAuthor = { ...args, born: args.setBornTo}
      const updatedAuthor = await Author.findByIdAndUpdate(author.id, updatingAuthor, { new: true })
      return updatedAuthor
    },
    createUser: (root, args) => {
      const user = new User({ ...args })
  
      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,username
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secred' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }

  
      const token = jwt.sign(userForToken, JWT_SECRET)



      return { value: token }    
    },
  },
  Subscription:  {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}











const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return  { currentUser } 
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)

})