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
