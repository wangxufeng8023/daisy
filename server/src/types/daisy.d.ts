interface DaisyConfig {
    url_prefix: string
    dburl: string
    dbname: string
    daterange: {
        from: string
        to: string
    }
    schoolterm: string
}

export { DaisyConfig }