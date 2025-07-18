export interface Province {
    id: number
    province: string
}

export interface Territory {
    id: number
    province: string
    territoire: string
}

export interface HealthArea {
    id: number
    territoire: string
    zone_sante: string
}