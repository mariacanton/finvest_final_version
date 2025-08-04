const tintColorLight = '#3A7D63'; // your button color
const tintColorDark = '#A3C9A8';  // inverse for dark mode, optional

export default {
  light: {
    text: '#1A1A1A',
    background: '#A3C9A8',
    tint: tintColorLight,
    tabIconDefault: '#5E6D55',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: tintColorDark,
    tabIconDefault: '#999',
    tabIconSelected: tintColorDark,
  },
};
