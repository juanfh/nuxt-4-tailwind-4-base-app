// Dependencia de User (campo `image`) — se porta en esta fase aunque el
// dominio "imágenes" en sí no lo pida.
export interface ImageBase {
  width: number
  height: number
  url: string
}

export interface Image extends ImageBase {
  id: string
  name: string
  thumbnail: ImageBase
  small: ImageBase
}
