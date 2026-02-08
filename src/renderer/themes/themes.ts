export interface ThemeColors {
  // Backgrounds
  bg: string
  surface: string
  elevated: string
  overlay: string
  darker: string

  // Borders
  border: string
  borderSubtle: string

  // Text
  text: string
  textSecondary: string
  textMuted: string
  textFaint: string

  // Accent
  accent: string
  accentHover: string
  accentMuted: string

  // Status
  success: string
  successMuted: string
  warning: string
  warningMuted: string
  error: string
  errorMuted: string

  // Syntax
  syntaxKeyword: string
  syntaxString: string
  syntaxNumber: string
  syntaxComment: string
}

export interface Theme {
  id: string
  name: string
  type: 'dark' | 'light'
  colors: ThemeColors
  // Preview colors for the theme picker
  preview: {
    bg: string
    accent: string
    text: string
  }
}

export const themes: Theme[] = [
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    type: 'dark',
    preview: { bg: '#1a1b26', accent: '#7aa2f7', text: '#c0caf5' },
    colors: {
      bg: '#0f0f14',
      surface: '#16161e',
      elevated: '#1e1e28',
      overlay: '#24243a',
      darker: '#0a0a0f',
      border: '#2a2b3d',
      borderSubtle: '#1e1f2e',
      text: '#c0caf5',
      textSecondary: '#a9b1d6',
      textMuted: '#565f89',
      textFaint: '#3b4261',
      accent: '#7aa2f7',
      accentHover: '#89b4fa',
      accentMuted: 'rgba(122, 162, 247, 0.15)',
      success: '#9ece6a',
      successMuted: 'rgba(158, 206, 106, 0.15)',
      warning: '#e0af68',
      warningMuted: 'rgba(224, 175, 104, 0.15)',
      error: '#f7768e',
      errorMuted: 'rgba(247, 118, 142, 0.15)',
      syntaxKeyword: '#bb9af7',
      syntaxString: '#9ece6a',
      syntaxNumber: '#ff9e64',
      syntaxComment: '#565f89',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    type: 'dark',
    preview: { bg: '#282a36', accent: '#bd93f9', text: '#f8f8f2' },
    colors: {
      bg: '#21222c',
      surface: '#282a36',
      elevated: '#343746',
      overlay: '#3d4051',
      darker: '#191a21',
      border: '#44475a',
      borderSubtle: '#383a4a',
      text: '#f8f8f2',
      textSecondary: '#e2e2dc',
      textMuted: '#6272a4',
      textFaint: '#4d5778',
      accent: '#bd93f9',
      accentHover: '#caa8fc',
      accentMuted: 'rgba(189, 147, 249, 0.15)',
      success: '#50fa7b',
      successMuted: 'rgba(80, 250, 123, 0.15)',
      warning: '#f1fa8c',
      warningMuted: 'rgba(241, 250, 140, 0.15)',
      error: '#ff5555',
      errorMuted: 'rgba(255, 85, 85, 0.15)',
      syntaxKeyword: '#ff79c6',
      syntaxString: '#f1fa8c',
      syntaxNumber: '#bd93f9',
      syntaxComment: '#6272a4',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    type: 'dark',
    preview: { bg: '#2e3440', accent: '#88c0d0', text: '#eceff4' },
    colors: {
      bg: '#242933',
      surface: '#2e3440',
      elevated: '#3b4252',
      overlay: '#434c5e',
      darker: '#1e222a',
      border: '#4c566a',
      borderSubtle: '#3b4252',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      textMuted: '#7b88a1',
      textFaint: '#5c6a82',
      accent: '#88c0d0',
      accentHover: '#8fbcbb',
      accentMuted: 'rgba(136, 192, 208, 0.15)',
      success: '#a3be8c',
      successMuted: 'rgba(163, 190, 140, 0.15)',
      warning: '#ebcb8b',
      warningMuted: 'rgba(235, 203, 139, 0.15)',
      error: '#bf616a',
      errorMuted: 'rgba(191, 97, 106, 0.15)',
      syntaxKeyword: '#81a1c1',
      syntaxString: '#a3be8c',
      syntaxNumber: '#b48ead',
      syntaxComment: '#616e88',
    },
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    type: 'dark',
    preview: { bg: '#282c34', accent: '#61afef', text: '#abb2bf' },
    colors: {
      bg: '#21252b',
      surface: '#282c34',
      elevated: '#2c323c',
      overlay: '#363c46',
      darker: '#1b1e24',
      border: '#3e4452',
      borderSubtle: '#2c323c',
      text: '#abb2bf',
      textSecondary: '#9da5b4',
      textMuted: '#636d83',
      textFaint: '#4b5263',
      accent: '#61afef',
      accentHover: '#74b9f0',
      accentMuted: 'rgba(97, 175, 239, 0.15)',
      success: '#98c379',
      successMuted: 'rgba(152, 195, 121, 0.15)',
      warning: '#e5c07b',
      warningMuted: 'rgba(229, 192, 123, 0.15)',
      error: '#e06c75',
      errorMuted: 'rgba(224, 108, 117, 0.15)',
      syntaxKeyword: '#c678dd',
      syntaxString: '#98c379',
      syntaxNumber: '#d19a66',
      syntaxComment: '#5c6370',
    },
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin',
    type: 'dark',
    preview: { bg: '#1e1e2e', accent: '#cba6f7', text: '#cdd6f4' },
    colors: {
      bg: '#11111b',
      surface: '#1e1e2e',
      elevated: '#313244',
      overlay: '#45475a',
      darker: '#0a0a10',
      border: '#45475a',
      borderSubtle: '#313244',
      text: '#cdd6f4',
      textSecondary: '#bac2de',
      textMuted: '#6c7086',
      textFaint: '#585b70',
      accent: '#cba6f7',
      accentHover: '#d4b4f8',
      accentMuted: 'rgba(203, 166, 247, 0.15)',
      success: '#a6e3a1',
      successMuted: 'rgba(166, 227, 161, 0.15)',
      warning: '#f9e2af',
      warningMuted: 'rgba(249, 226, 175, 0.15)',
      error: '#f38ba8',
      errorMuted: 'rgba(243, 139, 168, 0.15)',
      syntaxKeyword: '#cba6f7',
      syntaxString: '#a6e3a1',
      syntaxNumber: '#fab387',
      syntaxComment: '#6c7086',
    },
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    type: 'dark',
    preview: { bg: '#0d1117', accent: '#58a6ff', text: '#c9d1d9' },
    colors: {
      bg: '#010409',
      surface: '#0d1117',
      elevated: '#161b22',
      overlay: '#21262d',
      darker: '#000000',
      border: '#30363d',
      borderSubtle: '#21262d',
      text: '#c9d1d9',
      textSecondary: '#b1bac4',
      textMuted: '#6e7681',
      textFaint: '#484f58',
      accent: '#58a6ff',
      accentHover: '#79b8ff',
      accentMuted: 'rgba(88, 166, 255, 0.15)',
      success: '#3fb950',
      successMuted: 'rgba(63, 185, 80, 0.15)',
      warning: '#d29922',
      warningMuted: 'rgba(210, 153, 34, 0.15)',
      error: '#f85149',
      errorMuted: 'rgba(248, 81, 73, 0.15)',
      syntaxKeyword: '#ff7b72',
      syntaxString: '#a5d6ff',
      syntaxNumber: '#79c0ff',
      syntaxComment: '#6e7681',
    },
  },
  {
    id: 'monokai',
    name: 'Monokai',
    type: 'dark',
    preview: { bg: '#272822', accent: '#a6e22e', text: '#f8f8f2' },
    colors: {
      bg: '#1e1f1c',
      surface: '#272822',
      elevated: '#3e3d32',
      overlay: '#49483e',
      darker: '#171813',
      border: '#49483e',
      borderSubtle: '#3e3d32',
      text: '#f8f8f2',
      textSecondary: '#e8e8e2',
      textMuted: '#75715e',
      textFaint: '#5c5c4f',
      accent: '#a6e22e',
      accentHover: '#b8e84c',
      accentMuted: 'rgba(166, 226, 46, 0.15)',
      success: '#a6e22e',
      successMuted: 'rgba(166, 226, 46, 0.15)',
      warning: '#e6db74',
      warningMuted: 'rgba(230, 219, 116, 0.15)',
      error: '#f92672',
      errorMuted: 'rgba(249, 38, 114, 0.15)',
      syntaxKeyword: '#f92672',
      syntaxString: '#e6db74',
      syntaxNumber: '#ae81ff',
      syntaxComment: '#75715e',
    },
  },
  {
    id: 'light',
    name: 'Light',
    type: 'light',
    preview: { bg: '#ffffff', accent: '#2563eb', text: '#18181b' },
    colors: {
      bg: '#f5f5f7',
      surface: '#ffffff',
      elevated: '#fafafa',
      overlay: '#f0f0f2',
      darker: '#e8e8ec',
      border: '#d4d4d8',
      borderSubtle: '#e4e4e7',
      text: '#18181b',
      textSecondary: '#3f3f46',
      textMuted: '#71717a',
      textFaint: '#a1a1aa',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      accentMuted: 'rgba(37, 99, 235, 0.1)',
      success: '#16a34a',
      successMuted: 'rgba(22, 163, 74, 0.1)',
      warning: '#ca8a04',
      warningMuted: 'rgba(202, 138, 4, 0.1)',
      error: '#dc2626',
      errorMuted: 'rgba(220, 38, 38, 0.1)',
      syntaxKeyword: '#7c3aed',
      syntaxString: '#16a34a',
      syntaxNumber: '#ea580c',
      syntaxComment: '#71717a',
    },
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    type: 'light',
    preview: { bg: '#ffffff', accent: '#0969da', text: '#24292f' },
    colors: {
      bg: '#f6f8fa',
      surface: '#ffffff',
      elevated: '#f6f8fa',
      overlay: '#eaeef2',
      darker: '#d8dfe6',
      border: '#d0d7de',
      borderSubtle: '#e1e4e8',
      text: '#24292f',
      textSecondary: '#57606a',
      textMuted: '#6e7781',
      textFaint: '#8c959f',
      accent: '#0969da',
      accentHover: '#0550ae',
      accentMuted: 'rgba(9, 105, 218, 0.1)',
      success: '#1a7f37',
      successMuted: 'rgba(26, 127, 55, 0.1)',
      warning: '#9a6700',
      warningMuted: 'rgba(154, 103, 0, 0.1)',
      error: '#cf222e',
      errorMuted: 'rgba(207, 34, 46, 0.1)',
      syntaxKeyword: '#cf222e',
      syntaxString: '#0a3069',
      syntaxNumber: '#0550ae',
      syntaxComment: '#6e7781',
    },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    type: 'dark',
    preview: { bg: '#002b36', accent: '#268bd2', text: '#93a1a1' },
    colors: {
      bg: '#00212b',
      surface: '#002b36',
      elevated: '#073642',
      overlay: '#094652',
      darker: '#001a22',
      border: '#0a4f5c',
      borderSubtle: '#073642',
      text: '#93a1a1',
      textSecondary: '#839496',
      textMuted: '#586e75',
      textFaint: '#4a5d63',
      accent: '#268bd2',
      accentHover: '#2aa0e8',
      accentMuted: 'rgba(38, 139, 210, 0.2)',
      success: '#859900',
      successMuted: 'rgba(133, 153, 0, 0.2)',
      warning: '#b58900',
      warningMuted: 'rgba(181, 137, 0, 0.2)',
      error: '#dc322f',
      errorMuted: 'rgba(220, 50, 47, 0.2)',
      syntaxKeyword: '#859900',
      syntaxString: '#2aa198',
      syntaxNumber: '#d33682',
      syntaxComment: '#586e75',
    },
  },
]

export const defaultThemeId = 'tokyo-night'

export function getThemeById(id: string): Theme {
  return themes.find(t => t.id === id) ?? themes[0]
}
