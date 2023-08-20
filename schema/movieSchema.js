import z from 'zod'

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required'
    }),
    year: z.number().int().positive().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10),
    poster: z.string().url({
        message: 'Poster must be an url'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller']), {
        required_error: 'Movie genre required',
        invalid_type_error: 'Movie genre invalid'
    }
    )
})

export function validateMovie(object) {
    return movieSchema.safeParse(object)
}

export function validatePartialMovie(object) {
    return movieSchema.partial().safeParse(object)

}
