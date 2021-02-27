// eslint-disable-next-line
import React from 'react'
// import useSWR from 'swr'
// import {debounce} from 'lodash'
import PropTypes from 'prop-types'
import sanityClient from 'part:@sanity/base/client'
import Fieldset from 'part:@sanity/components/fieldsets/default'
import {FormBuilderInput} from 'part:@sanity/form-builder'

import PatchEvent, {
  setIfMissing, set, unset} from 'part:@sanity/form-builder/patch-event'

// import styles from './gpxInput.css'

import Gpx from 'gpx-parser-builder'


// const createPatchFrom = (value) => PatchEvent.from(value === '' ? unset() : set(value))

function computeGpxData(asset) {
  return sanityClient.getDocument(asset._ref).then((a) => {
    // console.log('Computing bounds for map file', asset.url)
    const {url} = a
    const serializer = new XMLSerializer()

    return fetch(url)
      .then((res) => res.text())
      .then((str) => (new window.DOMParser()).parseFromString(str, 'text/xml'))
      .then((res) => serializer.serializeToString(res))
      .then((res) => Gpx.parse(res))
      .then((res) => JSON.stringify(res))
  })
}

class GPXInput extends React.PureComponent {
  static propTypes = {
    type: PropTypes.shape({
      title: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      fields: PropTypes.array,
    }).isRequired,
    level: PropTypes.number,
    value: PropTypes.shape({
      _type: PropTypes.string
    }),
    focusPath: PropTypes.array.isRequired,
    onFocus: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired
  }

  firstFieldInput = React.createRef();


  handleFieldChange = (field, fieldPatchEvent) => {
    const {onChange, type} = this.props

    // If we see a set patch that sets the asset, use the file to compute the bounds
    const setAssetPatch = fieldPatchEvent.patches.find(
      (patch) => patch.type === 'set' &&
        patch.path.length === 1 &&
        patch.path[0] === 'asset' &&
        patch.value &&
        patch.value._ref
    )
    if (field.name === 'file' && setAssetPatch) {
      computeGpxData(setAssetPatch.value).then((data) => {
        onChange(PatchEvent.from([set(data, ['data'])]))
      })
    }

    // If we see a patch that removes the map asset file, unset the bounds field
    if (
      fieldPatchEvent.patches.find(
        (patch) => patch.type === 'unset' &&
          patch.path.length === 1 &&
          patch.path[0] === 'asset'
      )
    ) {
      onChange(PatchEvent.from([unset(['data'])]))
    }

    onChange(
      fieldPatchEvent
        .prefixAll(field.name)
        .prepend(setIfMissing({_type: type.name}))
    )
  }

  render() {
    const {
      type,
      value,
      level,
      focusPath,
      onFocus,
      onBlur
    } = this.props
    return (
      <Fieldset
        level={level}
        legend={type.title}
        description={type.description}
      >
        <div>
          {type.fields.map((field, i) => (
            // Delegate to the generic FormBuilderInput.
            // It will resolve and insert the actual input component
            // for the given field type
            <FormBuilderInput
              level={level + 1}
              ref={i === 0 ? this.firstFieldInput : null}
              readOnly={i === 1}
              key={field.name}
              type={field.type}
              value={value && value[field.name]}
              onChange={(patchEvent) => this.handleFieldChange(field, patchEvent)}
              path={[field.name]}
              focusPath={focusPath}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          ))}
        </div>
      </Fieldset>
    )
  }
}

export default GPXInput
