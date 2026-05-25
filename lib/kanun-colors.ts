export type ColorScheme = {
  primary: string
  light: string
  dark: string
}

export function getColorScheme(baslik: string): ColorScheme {
  const b = baslik.toLowerCase()
  if (b.includes('borçlar') || b.includes('borclar'))
    return { primary: '#185FA5', light: '#edf4fd', dark: '#0C447C' }
  if (b.includes('anayasa'))
    return { primary: '#1a6b3a', light: '#edf7f1', dark: '#0f4a28' }
  if (b.includes('ceza'))
    return { primary: '#8b2020', light: '#fdf0f0', dark: '#5a1010' }
  return { primary: '#185FA5', light: '#edf4fd', dark: '#0C447C' }
}
