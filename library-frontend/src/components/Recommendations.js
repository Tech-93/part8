import React from 'react'
import RecommendedBooks from './RecommendedBooks'

import { Query } from 'react-apollo'





const Recommendations = (props) => {

    


    if (!props.show) {
        return null
      }
    
    if (props.result.loading) {
        return <div>loading...</div>
      }


    const user = props.result.data.me




    return (
        <div>
            <h2> Recommendations </h2>

            <div> books in your favorite genre {user.favoriteGenre}  </div>
            <p></p>
            <Query query={props.ALL_BOOKS}  >
                {(result) => <RecommendedBooks result={result} user={user} />}
            </Query> 
        </div>
    )
}

export default Recommendations

