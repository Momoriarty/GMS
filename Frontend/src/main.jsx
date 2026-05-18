import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Route from './Route.jsx'
import { BrowserRouter } from "react-router-dom"
import './assets/tailwind.css'
createRoot(document.getElementById("root"))
    .render(
        <StrictMode>
            <BrowserRouter>
                <Route />
            </BrowserRouter>
        </StrictMode>
    )
