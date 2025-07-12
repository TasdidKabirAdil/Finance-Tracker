import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import App from './App'
import './styles/App.module.css'
import './styles/index.module.css'

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const client = new ApolloClient({
  uri: isLocal ? 'http://localhost:4000/graphql' : 'http://10.0.0.186:4000/graphql',
  cache: new InMemoryCache()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)

