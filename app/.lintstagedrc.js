const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames.join(' --file ')}`;

const buildPrettierCommand = (filenames) =>
  `prettier ${filenames.join(' ')} -w`;

export default {
  'src/**/*.{js,jsx,ts,tsx}': [buildEslintCommand],
  'src/**/*.{js,jsx,ts,tsx,md,html,css}': [buildPrettierCommand],
};
