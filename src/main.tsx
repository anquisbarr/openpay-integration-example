import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FormExtractExample from './components/FormExtractExample.tsx'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    <FormExtractExample />
  </StrictMode>,
)