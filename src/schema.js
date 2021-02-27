import inputComponent from './gpxInput'

export default {
  name: 'gpx',
  title: 'Gpx File',
  type: 'object',
  fields: [
    {
      type: 'file',
      name: 'file',
    },
    {
      type: 'string',
      name: 'data',
    },
  ],
  inputComponent,
}
