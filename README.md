# GPX File input for Sanity

Upload a GPX file and return stringified JSON.

Currently designed and built for my own uses. Contribution welcome.

## Usage
```
{
  fields: [
    // [...]
    {
      name: 'gpx',
      title: 'GPX',
      type: 'gpx'
    }
  ]
}
```
## Data Model
```
{
  _type: 'gpx',
  file: Asset,
  data: string
}
```