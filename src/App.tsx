import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import XBookmarkManager from './components/XBookmarkManager'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <XBookmarkManager />
    </ChakraProvider>
  )
}

export default App