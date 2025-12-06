module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Se estiver usando Expo
    plugins: [
      // Outros plugins que você já tenha (ex: react-native-dotenv) ficam aqui
      
      'react-native-reanimated/plugin', // <--- ADICIONE ESTA LINHA POR ÚLTIMO
    ],
  };
};