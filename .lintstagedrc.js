const buildPrettierCommand = (filenames) =>
  `prettier ${filenames.join(' ')} -w`;

export default {
  'programs/ruma/src/**/*.rs': 'cargo fmt --',
  'tests/**/*.ts': [buildPrettierCommand],
};