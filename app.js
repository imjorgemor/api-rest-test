const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')

const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schema/movieSchema')

const app = express()
app.disable('x-powered-by')

app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'https://movies.com',
            'https://midu.dev'
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))

app.get('/movies', (req, res) => {
    //cors se soluciona en el back
    //metodos normales: GET/HEAD/POST
    // se puede utilizar un middleware npm i cors -E
    // if (ACCEPTED_ORIGINS.includes(origin)) {
    //     res.header('Access-Control-Allow-Origin', origin)
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')

    // }
    // const origin = req.header('origin')

    const { genre } = req.query //en la req esta la query y podemos acceder a ella
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g > g.toLowerCase() === genre.toLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

//metodos complejos: PUT/PATCH/DELETE UTILIZAN EL CORS PRE-FLIGHT
//options

app.get('/movies/:id', (req, res) => { //path-to-regex se utiliza por debajo de express
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)
    //si no encuentra la movie que devuelva un 404
    res.status(404).json({ message: 'movie not found' })
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if (!result.success) {
        // 422 Unprocessable Entity
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    // en base de datos
    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }

    // Esto no sería REST, porque estamos guardando
    // el estado de la aplicación en memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1)

    return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
    console.log(`server successfully listening on port http://localhost:${PORT}`)
})

