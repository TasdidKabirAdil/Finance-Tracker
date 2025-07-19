import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import App from './App'
import './styles/index.css'

const client = new ApolloClient({
  // uri: 'http://localhost:4000/graphql',
  uri: 'https://finance-tracker-production-11b7.up.railway.app/graphql',
  cache: new InMemoryCache()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)